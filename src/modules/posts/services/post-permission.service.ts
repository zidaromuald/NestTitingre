// modules/posts/services/post-permission.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupeUser } from '../../groupes/entities/groupe-user.entity';
import { SocieteUser } from '../../societes/entities/societe-user.entity';
import { InvitationSuivi, InvitationSuiviStatus } from '../../suivis/entities/invitation-suivi.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class PostPermissionService {
  constructor(
    @InjectRepository(GroupeUser)
    private readonly groupeUserRepo: Repository<GroupeUser>,
    @InjectRepository(SocieteUser)
    private readonly societeUserRepo: Repository<SocieteUser>,
    @InjectRepository(InvitationSuivi)
    private readonly invitationSuiviRepo: Repository<InvitationSuivi>,
  ) {}

  /**
   * Vérifier si l'auteur est membre d'un groupe
   */
  async verifyGroupeMembership(
    author: User | Societe,
    groupeId: number,
  ): Promise<boolean> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const membership = await this.groupeUserRepo.findOne({
      where: {
        groupe_id: groupeId,
        member_id: authorId,
        member_type: authorType,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Vous devez être membre du groupe pour y publier',
      );
    }

    return true;
  }

  /**
   * Vérifier si l'auteur est membre/employé d'une société
   */
  async verifySocieteMembership(
    author: User | Societe,
    societeId: number,
  ): Promise<boolean> {
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    // Si c'est une société qui poste, elle doit poster sur sa propre page
    if (authorType === 'Societe') {
      if (author.id !== societeId) {
        throw new ForbiddenException(
          'Une société ne peut poster que sur sa propre page',
        );
      }
      return true;
    }

    // Si c'est un user, vérifier qu'il est employé de la société
    const membership = await this.societeUserRepo.findOne({
      where: {
        societe_id: societeId,
        user_id: author.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Vous devez être membre/employé de la société pour y publier',
      );
    }

    return true;
  }

  /**
   * Vérifier si l'auteur est admin d'un groupe
   */
  async isGroupeAdmin(
    author: User | Societe,
    groupeId: number,
  ): Promise<boolean> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const membership = await this.groupeUserRepo.findOne({
      where: {
        groupe_id: groupeId,
        member_id: authorId,
        member_type: authorType,
        role: 'admin',
      },
    });

    return !!membership;
  }

  /**
   * Vérifier si l'auteur est admin d'une société
   */
  async isSocieteAdmin(
    author: User | Societe,
    societeId: number,
  ): Promise<boolean> {
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    // Une société est toujours admin de sa propre page
    if (authorType === 'Societe' && author.id === societeId) {
      return true;
    }

    // Pour un user, vérifier son rôle
    if (authorType === 'User') {
      const membership = await this.societeUserRepo.findOne({
        where: {
          societe_id: societeId,
          user_id: author.id,
          role: 'admin',
        },
      });

      return !!membership;
    }

    return false;
  }

  /**
   * Récupérer les IDs des utilisateurs suivis par l'auteur
   */
  async getFollowedUserIds(author: User | Societe): Promise<number[]> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const suivis = await this.invitationSuiviRepo.find({
      where: {
        sender_id: authorId,
        sender_type: authorType,
        receiver_type: 'User',
        status: InvitationSuiviStatus.ACCEPTED,
      },
      select: ['receiver_id'],
    });

    return suivis.map((s) => s.receiver_id);
  }

  /**
   * Récupérer les IDs des sociétés suivies par l'auteur
   */
  async getFollowedSocieteIds(author: User | Societe): Promise<number[]> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const suivis = await this.invitationSuiviRepo.find({
      where: {
        sender_id: authorId,
        sender_type: authorType,
        receiver_type: 'Societe',
        status: InvitationSuiviStatus.ACCEPTED,
      },
      select: ['receiver_id'],
    });

    return suivis.map((s) => s.receiver_id);
  }

  /**
   * Récupérer les IDs des groupes dont l'auteur est membre
   */
  async getUserGroupeIds(author: User | Societe): Promise<number[]> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const memberships = await this.groupeUserRepo.find({
      where: {
        member_id: authorId,
        member_type: authorType,
      },
      select: ['groupe_id'],
    });

    return memberships.map((m) => m.groupe_id);
  }

  /**
   * Récupérer les IDs des groupes dont l'auteur est admin
   */
  async getUserAdminGroupeIds(author: User | Societe): Promise<number[]> {
    const authorId = author.id;
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    const memberships = await this.groupeUserRepo.find({
      where: {
        member_id: authorId,
        member_type: authorType,
        role: 'admin',
      },
      select: ['groupe_id'],
    });

    return memberships.map((m) => m.groupe_id);
  }

  /**
   * Récupérer les IDs des sociétés dont l'auteur est membre/employé
   */
  async getUserSocieteIds(author: User | Societe): Promise<number[]> {
    const authorType = author.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    // Si c'est une société, retourner son propre ID
    if (authorType === 'Societe') {
      return [author.id];
    }

    // Si c'est un user, récupérer les sociétés dont il est membre
    const memberships = await this.societeUserRepo.find({
      where: {
        user_id: author.id,
      },
      select: ['societe_id'],
    });

    return memberships.map((m) => m.societe_id);
  }
}
