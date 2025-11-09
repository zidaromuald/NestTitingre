// modules/groupes/services/groupe-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Groupe } from '../entities/groupe.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Post } from '../../posts/entities/post.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques des Groupes
 * Similaire aux relations morphTo/morphMany de Laravel
 */
@Injectable()
export class GroupePolymorphicService {
  constructor(
    @InjectRepository(Groupe)
    private readonly groupeRepository: Repository<Groupe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Récupérer le créateur d'un groupe (User ou Societe)
   */
  async getCreateur(groupe: Groupe): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: groupe.created_by_id,
        type: groupe.created_by_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer tous les groupes créés par un User
   */
  async getGroupesByUser(userId: number): Promise<Groupe[]> {
    return this.groupeRepository.find({
      where: {
        created_by_id: userId,
        created_by_type: PolymorphicTypes.USER,
      },
    });
  }

  /**
   * Récupérer tous les groupes créés par une Societe
   * Équivalent: $societe->groupesCrees() dans Laravel
   */
  async getGroupesBySociete(societeId: number): Promise<Groupe[]> {
    return this.groupeRepository.find({
      where: {
        created_by_id: societeId,
        created_by_type: PolymorphicTypes.SOCIETE,
      },
    });
  }

  /**
   * Créer un groupe avec créateur polymorphique
   */
  async createGroupeWithCreateur(
    groupeData: Partial<Groupe>,
    createur: User | Societe,
  ): Promise<Groupe> {
    const typeName = PolymorphicHelper.getTypeName(createur);

    const groupe = this.groupeRepository.create({
      ...groupeData,
      created_by_id: createur.id,
      created_by_type: typeName,
    });

    return this.groupeRepository.save(groupe);
  }

  /**
   * Récupérer tous les posts d'un groupe avec leurs auteurs polymorphiques
   */
  async getGroupePostsWithAuthors(groupeId: number): Promise<
    Array<{
      post: Post;
      author: User | Societe;
    }>
  > {
    const posts = await this.postRepository.find({
      where: { groupe_id: groupeId },
    });

    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await PolymorphicHelper.morphTo<User | Societe>(
          {
            id: post.posted_by_id,
            type: post.posted_by_type,
          },
          repositories,
        );

        return { post, author: author! };
      }),
    );

    return postsWithAuthors;
  }

  /**
   * Vérifier si une entité peut gérer un groupe
   * Équivalent: $groupe->canBeManageBy($user) dans Laravel
   */
  async canManageGroupe(
    groupe: Groupe,
    user: User,
    userSocietes?: Societe[],
  ): Promise<boolean> {
    // Si créé par un User
    if (groupe.created_by_type === PolymorphicTypes.USER) {
      if (groupe.created_by_id === user.id) {
        return true;
      }

      // Vérifier si admin du groupe (nécessite de charger la relation pivot)
      // Pour l'instant, retourne false
      return false;
    }

    // Si créé par une Société
    if (groupe.created_by_type === PolymorphicTypes.SOCIETE) {
      // Admin désigné
      if (groupe.admin_user_id && groupe.admin_user_id === user.id) {
        return true;
      }

      // Vérifier si l'user est admin de la société créatrice
      if (userSocietes) {
        const isAdminOfCreatorSociete = userSocietes.some(
          (s) => s.id === groupe.created_by_id,
        );
        if (isAdminOfCreatorSociete) {
          return true;
        }
      }

      return false;
    }

    return false;
  }

  /**
   * Vérifier si un user peut voir un groupe
   * Équivalent: $groupe->canBeViewedBy($user) dans Laravel
   */
  canViewGroupe(
    groupe: Groupe,
    user: User,
    userSocietes?: Societe[],
  ): boolean {
    // Groupe public = accessible à tous
    if (groupe.type === 'public') {
      return true;
    }

    // Groupe privé créé par le user
    if (
      groupe.created_by_type === PolymorphicTypes.USER &&
      groupe.created_by_id === user.id
    ) {
      return true;
    }

    // Si créé par société et user appartient à cette société
    if (
      groupe.created_by_type === PolymorphicTypes.SOCIETE &&
      userSocietes
    ) {
      const belongsToCreatorSociete = userSocietes.some(
        (s) => s.id === groupe.created_by_id,
      );
      if (belongsToCreatorSociete) {
        return true;
      }
    }

    // Si membre du groupe (nécessite de charger la relation)
    // Pour l'instant, retourne false
    return false;
  }
}
