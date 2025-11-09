// modules/posts/services/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostVisibility } from '../entities/post.entity';
import { PostRepository, PostSearchFilters } from '../repositories/post.repository';
import { PostPolymorphicService } from './post-polymorphic.service';
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

      // TODO: Vérifier que l'auteur est membre du groupe
      // await this.verifyGroupeMembership(author, createPostDto.groupe_id);
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

      // TODO: Vérifier que l'auteur est membre/employé de la société
      // await this.verifySocieteMembership(author, createPostDto.societe_id);
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
  async togglePin(id: number, _currentUser: User | Societe): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // TODO: Vérifier que _currentUser est admin du groupe
    // if (post.groupe_id) {
    //   await this.verifyGroupeAdmin(_currentUser, post.groupe_id);
    // }

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
