// modules/posts/services/commentaire-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commentaire } from '../entities/commentaire.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Post } from '../entities/post.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques des Commentaires
 */
@Injectable()
export class CommentairePolymorphicService {
  constructor(
    @InjectRepository(Commentaire)
    private readonly commentaireRepository: Repository<Commentaire>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Récupérer l'auteur d'un commentaire (User ou Societe)
   * Équivalent: $commentaire->commentable dans Laravel
   */
  async getCommentable(commentaire: Commentaire): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: commentaire.commentable_id,
        type: commentaire.commentable_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer tous les commentaires créés par un User
   * Équivalent: $user->commentaires() dans Laravel
   */
  async getCommentairesByUser(userId: number): Promise<Commentaire[]> {
    return this.commentaireRepository.find({
      where: {
        commentable_id: userId,
        commentable_type: PolymorphicTypes.USER,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer tous les commentaires créés par une Societe
   * Équivalent: $societe->commentaires() dans Laravel
   */
  async getCommentairesBySociete(societeId: number): Promise<Commentaire[]> {
    return this.commentaireRepository.find({
      where: {
        commentable_id: societeId,
        commentable_type: PolymorphicTypes.SOCIETE,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer tous les commentaires d'un post
   */
  async getCommentairesByPost(postId: number): Promise<Commentaire[]> {
    return this.commentaireRepository.find({
      where: { post_id: postId },
      order: { created_at: 'ASC' }, // Les commentaires sont généralement triés par ordre chronologique
    });
  }

  /**
   * Créer un commentaire avec auteur polymorphique
   */
  async createCommentaire(
    post: Post,
    commenter: User | Societe,
    contenu: string,
  ): Promise<Commentaire> {
    const typeName = PolymorphicHelper.getTypeName(commenter);

    const commentaire = this.commentaireRepository.create({
      post_id: post.id,
      commentable_id: commenter.id,
      commentable_type: typeName,
      contenu,
    });

    // Sauvegarder le commentaire
    const savedCommentaire = await this.commentaireRepository.save(commentaire);

    // Incrémenter le compteur de commentaires sur le post
    await this.postRepository.increment(
      { id: post.id },
      'comments_count',
      1,
    );

    return savedCommentaire;
  }

  /**
   * Modifier un commentaire
   */
  async updateCommentaire(
    commentaireId: number,
    contenu: string,
  ): Promise<Commentaire> {
    const commentaire = await this.commentaireRepository.findOne({
      where: { id: commentaireId },
    });

    if (!commentaire) {
      throw new Error('Commentaire not found');
    }

    commentaire.contenu = contenu;
    return this.commentaireRepository.save(commentaire);
  }

  /**
   * Supprimer un commentaire
   */
  async removeCommentaire(
    commentaire: Commentaire,
  ): Promise<boolean> {
    const postId = commentaire.post_id;

    await this.commentaireRepository.remove(commentaire);

    // Décrémenter le compteur de commentaires sur le post
    await this.postRepository.decrement(
      { id: postId },
      'comments_count',
      1,
    );

    return true;
  }

  /**
   * Vérifier si une entité peut modifier un commentaire
   */
  canEditCommentaire(commentaire: Commentaire, entity: User | Societe): boolean {
    const typeName = PolymorphicHelper.getTypeName(entity);

    return (
      commentaire.commentable_id === entity.id &&
      commentaire.commentable_type === typeName
    );
  }

  /**
   * Récupérer les commentaires d'un post avec leurs auteurs
   */
  async getCommentairesWithAuthors(postId: number): Promise<
    Array<{
      commentaire: Commentaire;
      author: User | Societe;
    }>
  > {
    const commentaires = await this.getCommentairesByPost(postId);

    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    const commentairesWithAuthors = await Promise.all(
      commentaires.map(async (commentaire) => {
        const author = await PolymorphicHelper.morphTo<User | Societe>(
          {
            id: commentaire.commentable_id,
            type: commentaire.commentable_type,
          },
          repositories,
        );

        return { commentaire, author: author! };
      }),
    );

    return commentairesWithAuthors;
  }

  /**
   * Compter les commentaires d'un post
   */
  async countCommentaires(postId: number): Promise<number> {
    return this.commentaireRepository.count({
      where: { post_id: postId },
    });
  }

  /**
   * Récupérer les posts commentés par un utilisateur
   */
  async getCommentedPostsByUser(userId: number): Promise<Post[]> {
    const commentaires = await this.getCommentairesByUser(userId);
    const postIds = [...new Set(commentaires.map((c) => c.post_id))]; // Dédupliquer

    if (postIds.length === 0) {
      return [];
    }

    return this.postRepository.findByIds(postIds);
  }

  /**
   * Récupérer les posts commentés par une société
   */
  async getCommentedPostsBySociete(societeId: number): Promise<Post[]> {
    const commentaires = await this.getCommentairesBySociete(societeId);
    const postIds = [...new Set(commentaires.map((c) => c.post_id))]; // Dédupliquer

    if (postIds.length === 0) {
      return [];
    }

    return this.postRepository.findByIds(postIds);
  }
}
