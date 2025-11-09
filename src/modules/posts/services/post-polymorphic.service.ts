// modules/posts/services/post-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques des Posts
 */
@Injectable()
export class PostPolymorphicService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
  ) {}

  /**
   * Récupérer l'auteur d'un post (User ou Societe)
   * Équivalent: $post->postedBy dans Laravel
   */
  async getAuthor(post: Post): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: post.posted_by_id,
        type: post.posted_by_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer tous les posts créés par un User
   * Équivalent: $user->posts() dans Laravel
   */
  async getPostsByUser(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: {
        posted_by_id: userId,
        posted_by_type: PolymorphicTypes.USER,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer tous les posts créés par une Societe
   * Équivalent: $societe->posts() dans Laravel
   */
  async getPostsBySociete(societeId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: {
        posted_by_id: societeId,
        posted_by_type: PolymorphicTypes.SOCIETE,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Créer un post avec auteur polymorphique
   */
  async createPostWithAuthor(
    postData: Partial<Post>,
    author: User | Societe,
  ): Promise<Post> {
    const typeName = PolymorphicHelper.getTypeName(author);

    const post = this.postRepository.create({
      ...postData,
      posted_by_id: author.id,
      posted_by_type: typeName,
    });

    return this.postRepository.save(post);
  }

  /**
   * Récupérer plusieurs posts avec leurs auteurs
   */
  async getPostsWithAuthors(postIds: number[]): Promise<
    Array<{
      post: Post;
      author: User | Societe;
    }>
  > {
    const posts = await this.postRepository.findByIds(postIds);

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
   * Vérifier si une entité peut modifier un post
   */
  canEditPost(post: Post, entity: User | Societe): boolean {
    const typeName = PolymorphicHelper.getTypeName(entity);

    return (
      post.posted_by_id === entity.id && post.posted_by_type === typeName
    );
  }
}
