// modules/posts/services/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Post, PostVisibility } from '../entities/post.entity';
import { PostRepository, PostSearchFilters } from '../repositories/post.repository';
import { PostPolymorphicService } from './post-polymorphic.service';
import { PostPermissionService } from './post-permission.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Groupe } from '../../groupes/entities/groupe.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly postRepository: PostRepository,
    private readonly postPolymorphicService: PostPolymorphicService,
    private readonly postPermissionService: PostPermissionService,
    @InjectRepository(Groupe)
    private readonly groupeRepo: Repository<Groupe>,
  ) {}

  /**
   * Créer un nouveau post
   */
  async create(
    createPostDto: CreatePostDto,
    author: User | Societe,
  ): Promise<Post> {
    // Validation: Un post ne peut pas être dans un groupe ET une société en même temps
    if (createPostDto.groupe_id && createPostDto.societe_id) {
      throw new ForbiddenException(
        'Un post ne peut pas être publié dans un groupe ET une société en même temps',
      );
    }

    // Vérifier si le groupe existe (si post dans un groupe)
    if (createPostDto.groupe_id) {
      const groupe = await this.groupeRepo.findOne({
        where: { id: createPostDto.groupe_id },
      });

      if (!groupe) {
        throw new NotFoundException(
          `Groupe avec l'ID ${createPostDto.groupe_id} introuvable`,
        );
      }

      // Vérifier que l'auteur est membre du groupe
      await this.postPermissionService.verifyGroupeMembership(
        author,
        createPostDto.groupe_id,
      );

      // Forcer la visibilité pour les posts de groupe
      // Si pas de visibilité spécifiée ou si public, forcer à membres_only
      if (!createPostDto.visibility || createPostDto.visibility === PostVisibility.PUBLIC) {
        createPostDto.visibility = PostVisibility.MEMBRES_ONLY;
      }
    }

    // Vérifier si la société existe (si post dans une société)
    if (createPostDto.societe_id) {
      const societe = await this.groupeRepo.findOne({
        where: { id: createPostDto.societe_id },
      });

      if (!societe) {
        throw new NotFoundException(
          `Société avec l'ID ${createPostDto.societe_id} introuvable`,
        );
      }

      // Vérifier que l'auteur est membre/employé de la société
      await this.postPermissionService.verifySocieteMembership(
        author,
        createPostDto.societe_id,
      );

      // Forcer la visibilité pour les posts de société
      // Si pas de visibilité spécifiée ou si public, forcer à membres_only
      if (!createPostDto.visibility || createPostDto.visibility === PostVisibility.PUBLIC) {
        createPostDto.visibility = PostVisibility.MEMBRES_ONLY;
      }
    }

    return this.postPolymorphicService.createPostWithAuthor(
      createPostDto,
      author,
    );
  }

  /**
   * Récupérer un post par ID avec auteur et groupe
   */
  async findOne(id: number): Promise<{
    post: Post;
    author: User | Societe | null;
    groupe: Groupe | null;
  }> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['groupe'],
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    const author = await this.postPolymorphicService.getAuthor(post);

    return { post, author, groupe: post.groupe };
  }

  /**
   * Mettre à jour un post
   */
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    currentUser: User | Societe,
  ): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // Vérifier que l'utilisateur est l'auteur
    if (!this.postPolymorphicService.canEditPost(post, currentUser)) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à modifier ce post',
      );
    }

    Object.assign(post, updatePostDto);
    post.is_edited = true;
    post.edited_at = new Date();

    return this.postRepo.save(post);
  }

  /**
   * Supprimer un post
   */
  async remove(id: number, currentUser: User | Societe): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    if (!this.postPolymorphicService.canEditPost(post, currentUser)) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à supprimer ce post',
      );
    }

    await this.postRepo.remove(post);
  }

  /**
   * Récupérer les posts d'un auteur (User ou Societe)
   */
  async getPostsByAuthor(
    authorId: number,
    authorType: string,
    includeGroupPosts = false,
  ): Promise<Post[]> {
    return this.postRepository.findByAuthor(authorId, authorType, {
      includeGroupPosts,
    });
  }

  /**
   * Récupérer les posts d'un groupe
   */
  async getPostsByGroupe(
    groupeId: number,
    visibility?: PostVisibility,
  ): Promise<Post[]> {
    return this.postRepository.findByGroupe(groupeId, { visibility });
  }

  /**
   * Récupérer le feed public
   */
  async getFeed(options?: {
    limit?: number;
    offset?: number;
    onlyWithMedia?: boolean;
  }): Promise<Post[]> {
    return this.postRepository.getFeed(options);
  }

  /**
   * Récupérer le feed personnalisé d'un utilisateur
   * Inclut:
   * - Posts des utilisateurs/sociétés qu'il suit
   * - Posts des groupes dont il est membre
   * - Ses propres posts
   */
  async getPersonalizedFeed(
    currentUser: User | Societe,
    options?: {
      limit?: number;
      offset?: number;
      onlyWithMedia?: boolean;
    },
  ): Promise<Post[]> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const currentUserId = currentUser.id;
    const currentUserType = currentUser.constructor.name === 'User'
      ? 'User'
      : 'Societe';

    // Récupérer les IDs des entités suivies
    const followedUserIds = await this.postPermissionService.getFollowedUserIds(currentUser);
    const followedSocieteIds = await this.postPermissionService.getFollowedSocieteIds(currentUser);

    // Récupérer les IDs des groupes dont l'utilisateur est membre
    const memberGroupeIds = await this.postPermissionService.getUserGroupeIds(currentUser);

    // Récupérer les IDs des groupes dont l'utilisateur est admin
    const adminGroupeIds = await this.postPermissionService.getUserAdminGroupeIds(currentUser);

    // Récupérer les IDs des sociétés dont l'utilisateur est membre/employé
    const employeeSocieteIds = await this.postPermissionService.getUserSocieteIds(currentUser);

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.groupe', 'groupe')
      .where(
        new Brackets((qb) => {
          // Mes propres posts
          qb.where(
            'post.posted_by_id = :currentUserId AND post.posted_by_type = :currentUserType',
            { currentUserId, currentUserType },
          );

          // Posts personnels (public) des users suivis
          if (followedUserIds.length > 0) {
            qb.orWhere(
              `post.posted_by_id IN (:...followedUserIds)
               AND post.posted_by_type = 'User'
               AND post.groupe_id IS NULL
               AND post.societe_id IS NULL
               AND post.visibility = :publicVisibility`,
              { followedUserIds, publicVisibility: PostVisibility.PUBLIC },
            );
          }

          // Posts personnels (public) des sociétés suivies
          if (followedSocieteIds.length > 0) {
            qb.orWhere(
              `post.posted_by_id IN (:...followedSocieteIds)
               AND post.posted_by_type = 'Societe'
               AND post.groupe_id IS NULL
               AND post.societe_id IS NULL
               AND post.visibility = :publicVisibility`,
              { followedSocieteIds, publicVisibility: PostVisibility.PUBLIC },
            );
          }

          // Posts dans mes groupes (public et membres_only)
          if (memberGroupeIds.length > 0) {
            qb.orWhere(
              `post.groupe_id IN (:...memberGroupeIds)
               AND post.visibility IN (:...memberVisibilities)`,
              {
                memberGroupeIds,
                memberVisibilities: [PostVisibility.PUBLIC, PostVisibility.MEMBRES_ONLY],
              },
            );
          }

          // Posts admin only dans les groupes où je suis admin
          if (adminGroupeIds.length > 0) {
            qb.orWhere(
              `post.groupe_id IN (:...adminGroupeIds)
               AND post.visibility = :adminVisibility`,
              {
                adminGroupeIds,
                adminVisibility: PostVisibility.ADMINS_ONLY,
              },
            );
          }

          // Posts dans les sociétés dont je suis membre/employé
          if (employeeSocieteIds.length > 0) {
            qb.orWhere(
              `post.societe_id IN (:...employeeSocieteIds)
               AND post.visibility IN (:...societeMemberVisibilities)`,
              {
                employeeSocieteIds,
                societeMemberVisibilities: [PostVisibility.PUBLIC, PostVisibility.MEMBRES_ONLY],
              },
            );
          }
        }),
      )
      .orderBy('post.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    if (options?.onlyWithMedia) {
      query.andWhere(
        new Brackets((mediaQb) => {
          mediaQb
            .where('post.images IS NOT NULL AND jsonb_array_length(post.images) > 0')
            .orWhere('post.videos IS NOT NULL AND jsonb_array_length(post.videos) > 0')
            .orWhere('post.audios IS NOT NULL AND jsonb_array_length(post.audios) > 0')
            .orWhere('post.documents IS NOT NULL AND jsonb_array_length(post.documents) > 0');
        }),
      );
    }

    return query.getMany();
  }

  /**
   * Rechercher des posts
   */
  async search(filters: PostSearchFilters): Promise<Post[]> {
    return this.postRepository.searchWithFilters(filters);
  }

  /**
   * Récupérer les posts tendances
   */
  async getTrendingPosts(limit = 10): Promise<Post[]> {
    return this.postRepository.getTrendingPosts(limit);
  }

  /**
   * Épingler/désépingler un post (admin groupe uniquement)
   */
  async togglePin(id: number, currentUser: User | Societe): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // Vérifier que currentUser est admin du groupe ou de la société
    if (post.groupe_id) {
      const isAdmin = await this.postPermissionService.isGroupeAdmin(
        currentUser,
        post.groupe_id,
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          'Seuls les administrateurs du groupe peuvent épingler/désépingler des posts',
        );
      }
    }

    if (post.societe_id) {
      const isAdmin = await this.postPermissionService.isSocieteAdmin(
        currentUser,
        post.societe_id,
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          'Seuls les administrateurs de la société peuvent épingler/désépingler des posts',
        );
      }
    }

    post.is_pinned = !post.is_pinned;
    return this.postRepo.save(post);
  }

  /**
   * Incrémenter le compteur de partages
   */
  async incrementSharesCount(id: number): Promise<void> {
    await this.postRepo.increment({ id }, 'shares_count', 1);
  }

  /**
   * Récupérer les posts avec leurs auteurs (pour le feed)
   */
  async getPostsWithAuthors(postIds: number[]): Promise<
    Array<{
      post: Post;
      author: User | Societe;
      groupe?: Groupe;
    }>
  > {
    const posts = await this.postRepo.find({
      where: postIds.map(id => ({ id })),
      relations: ['groupe'],
    });

    const postsWithAuthors = await this.postPolymorphicService.getPostsWithAuthors(
      postIds,
    );

    return postsWithAuthors.map((item) => ({
      ...item,
      groupe: posts.find((p) => p.id === item.post.id)?.groupe,
    }));
  }
}
