// modules/posts/services/like-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Post } from '../entities/post.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques des Likes
 */
@Injectable()
export class LikePolymorphicService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Récupérer l'auteur d'un like (User ou Societe)
   * Équivalent: $like->likeable dans Laravel
   */
  async getLikeable(like: Like): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: like.likeable_id,
        type: like.likeable_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer tous les likes donnés par un User
   * Équivalent: $user->likes() dans Laravel
   */
  async getLikesByUser(userId: number): Promise<Like[]> {
    return this.likeRepository.find({
      where: {
        likeable_id: userId,
        likeable_type: PolymorphicTypes.USER,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer tous les likes donnés par une Societe
   * Équivalent: $societe->likes() dans Laravel
   */
  async getLikesBySociete(societeId: number): Promise<Like[]> {
    return this.likeRepository.find({
      where: {
        likeable_id: societeId,
        likeable_type: PolymorphicTypes.SOCIETE,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Créer un like avec auteur polymorphique
   */
  async createLike(
    post: Post,
    liker: User | Societe,
  ): Promise<Like> {
    const typeName = PolymorphicHelper.getTypeName(liker);

    // Vérifier si le like existe déjà
    const existingLike = await this.likeRepository.findOne({
      where: {
        post_id: post.id,
        likeable_id: liker.id,
        likeable_type: typeName,
      },
    });

    if (existingLike) {
      return existingLike;
    }

    const like = this.likeRepository.create({
      post_id: post.id,
      likeable_id: liker.id,
      likeable_type: typeName,
    });

    // Sauvegarder le like
    const savedLike = await this.likeRepository.save(like);

    // Incrémenter le compteur de likes sur le post
    await this.postRepository.increment(
      { id: post.id },
      'likes_count',
      1,
    );

    return savedLike;
  }

  /**
   * Supprimer un like (unlike)
   */
  async removeLike(
    post: Post,
    liker: User | Societe,
  ): Promise<boolean> {
    const typeName = PolymorphicHelper.getTypeName(liker);

    const like = await this.likeRepository.findOne({
      where: {
        post_id: post.id,
        likeable_id: liker.id,
        likeable_type: typeName,
      },
    });

    if (!like) {
      return false;
    }

    await this.likeRepository.remove(like);

    // Décrémenter le compteur de likes sur le post
    await this.postRepository.decrement(
      { id: post.id },
      'likes_count',
      1,
    );

    return true;
  }

  /**
   * Vérifier si une entité a liké un post
   */
  async hasLiked(
    post: Post,
    liker: User | Societe,
  ): Promise<boolean> {
    const typeName = PolymorphicHelper.getTypeName(liker);

    const like = await this.likeRepository.findOne({
      where: {
        post_id: post.id,
        likeable_id: liker.id,
        likeable_type: typeName,
      },
    });

    return !!like;
  }

  /**
   * Récupérer les likes d'un post avec leurs auteurs
   */
  async getLikesWithAuthors(postId: number): Promise<
    Array<{
      like: Like;
      author: User | Societe;
    }>
  > {
    const likes = await this.likeRepository.find({
      where: { post_id: postId },
      order: { created_at: 'DESC' },
    });

    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    const likesWithAuthors = await Promise.all(
      likes.map(async (like) => {
        const author = await PolymorphicHelper.morphTo<User | Societe>(
          {
            id: like.likeable_id,
            type: like.likeable_type,
          },
          repositories,
        );

        return { like, author: author! };
      }),
    );

    return likesWithAuthors;
  }

  /**
   * Compter les likes d'un post
   */
  async countLikes(postId: number): Promise<number> {
    return this.likeRepository.count({
      where: { post_id: postId },
    });
  }

  /**
   * Récupérer les posts likés par un utilisateur
   */
  async getLikedPostsByUser(userId: number): Promise<Post[]> {
    const likes = await this.getLikesByUser(userId);
    const postIds = likes.map((like) => like.post_id);

    if (postIds.length === 0) {
      return [];
    }

    return this.postRepository.findByIds(postIds);
  }

  /**
   * Récupérer les posts likés par une société
   */
  async getLikedPostsBySociete(societeId: number): Promise<Post[]> {
    const likes = await this.getLikesBySociete(societeId);
    const postIds = likes.map((like) => like.post_id);

    if (postIds.length === 0) {
      return [];
    }

    return this.postRepository.findByIds(postIds);
  }
}
