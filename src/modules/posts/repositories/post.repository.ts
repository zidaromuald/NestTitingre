// modules/posts/repositories/post.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostVisibility } from '../entities/post.entity';

export interface PostSearchFilters {
  authorId?: number;
  authorType?: string;
  groupeId?: number;
  visibility?: PostVisibility;
  hasMedia?: boolean;
  isPinned?: boolean;
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

  /**
   * Rechercher des posts par contenu
   */
  async searchByContent(query: string, limit = 20): Promise<Post[]> {
    return this.createQueryBuilder('post')
      .where('post.contenu ILIKE :query', { query: `%${query}%` })
      .orderBy('post.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Récupérer les posts d'un auteur (User ou Societe)
   */
  async findByAuthor(
    authorId: number,
    authorType: string,
    options?: { includeGroupPosts?: boolean; limit?: number },
  ): Promise<Post[]> {
    const query = this.createQueryBuilder('post')
      .where('post.posted_by_id = :authorId', { authorId })
      .andWhere('post.posted_by_type = :authorType', { authorType });

    // Si on veut seulement les posts personnels (pas dans les groupes)
    if (!options?.includeGroupPosts) {
      query.andWhere('post.groupe_id IS NULL');
    }

    query
      .orderBy('post.created_at', 'DESC')
      .take(options?.limit || 50);

    return query.getMany();
  }

  /**
   * Récupérer les posts d'un groupe
   */
  async findByGroupe(
    groupeId: number,
    options?: { visibility?: PostVisibility; limit?: number },
  ): Promise<Post[]> {
    const query = this.createQueryBuilder('post')
      .where('post.groupe_id = :groupeId', { groupeId });

    if (options?.visibility) {
      query.andWhere('post.visibility = :visibility', {
        visibility: options.visibility,
      });
    }

    query
      .orderBy('post.is_pinned', 'DESC')
      .addOrderBy('post.created_at', 'DESC')
      .take(options?.limit || 50);

    return query.getMany();
  }

  /**
   * Récupérer le feed (posts publics récents)
   */
  async getFeed(options?: {
    limit?: number;
    offset?: number;
    onlyWithMedia?: boolean;
  }): Promise<Post[]> {
    const query = this.createQueryBuilder('post')
      .where('post.visibility = :visibility', {
        visibility: PostVisibility.PUBLIC,
      });

    if (options?.onlyWithMedia) {
      query.andWhere(
        '(post.images IS NOT NULL OR post.videos IS NOT NULL OR post.audios IS NOT NULL OR post.documents IS NOT NULL)',
      );
    }

    query
      .orderBy('post.created_at', 'DESC')
      .skip(options?.offset || 0)
      .take(options?.limit || 20);

    return query.getMany();
  }

  /**
   * Recherche avancée avec filtres multiples
   */
  async searchWithFilters(filters: PostSearchFilters): Promise<Post[]> {
    const query = this.createQueryBuilder('post');

    if (filters.authorId && filters.authorType) {
      query
        .andWhere('post.posted_by_id = :authorId', {
          authorId: filters.authorId,
        })
        .andWhere('post.posted_by_type = :authorType', {
          authorType: filters.authorType,
        });
    }

    if (filters.groupeId !== undefined) {
      if (filters.groupeId === null) {
        query.andWhere('post.groupe_id IS NULL');
      } else {
        query.andWhere('post.groupe_id = :groupeId', {
          groupeId: filters.groupeId,
        });
      }
    }

    if (filters.visibility) {
      query.andWhere('post.visibility = :visibility', {
        visibility: filters.visibility,
      });
    }

    if (filters.isPinned !== undefined) {
      query.andWhere('post.is_pinned = :isPinned', {
        isPinned: filters.isPinned,
      });
    }

    if (filters.hasMedia !== undefined) {
      if (filters.hasMedia === true) {
        // Posts AVEC média
        query.andWhere(
          '(post.images IS NOT NULL OR post.videos IS NOT NULL OR post.audios IS NOT NULL OR post.documents IS NOT NULL)',
        );
      } else {
        // Posts SANS média
        query.andWhere(
          '(post.images IS NULL AND post.videos IS NULL AND post.audios IS NULL AND post.documents IS NULL)',
        );
      }
    }

    if (filters.searchQuery) {
      query.andWhere('post.contenu ILIKE :searchQuery', {
        searchQuery: `%${filters.searchQuery}%`,
      });
    }

    if (filters.startDate) {
      query.andWhere('post.created_at >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('post.created_at <= :endDate', {
        endDate: filters.endDate,
      });
    }

    return query.orderBy('post.created_at', 'DESC').getMany();
  }

  /**
   * Récupérer les posts populaires (plus de likes/commentaires)
   */
  async getTrendingPosts(limit = 10): Promise<Post[]> {
    return this.createQueryBuilder('post')
      .where('post.visibility = :visibility', {
        visibility: PostVisibility.PUBLIC,
      })
      .orderBy('post.likes_count + post.comments_count', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Récupérer les posts épinglés d'un groupe
   */
  async getPinnedPostsByGroupe(groupeId: number): Promise<Post[]> {
    return this.find({
      where: {
        groupe_id: groupeId,
        is_pinned: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Compter les posts d'un auteur
   */
  async countByAuthor(authorId: number, authorType: string): Promise<number> {
    return this.count({
      where: {
        posted_by_id: authorId,
        posted_by_type: authorType,
      },
    });
  }

  /**
   * Compter les posts d'un groupe
   */
  async countByGroupe(groupeId: number): Promise<number> {
    return this.count({
      where: {
        groupe_id: groupeId,
      },
    });
  }

  /**
   * Vérifier si un auteur a posté dans un groupe
   */
  async hasPostedInGroupe(
    authorId: number,
    authorType: string,
    groupeId: number,
  ): Promise<boolean> {
    const count = await this.count({
      where: {
        posted_by_id: authorId,
        posted_by_type: authorType,
        groupe_id: groupeId,
      },
    });

    return count > 0;
  }
}
