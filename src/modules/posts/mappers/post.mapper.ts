// modules/posts/mappers/post.mapper.ts
import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Groupe } from '../../groupes/entities/groupe.entity';

export interface PostAuthorData {
  id: number;
  type: string;
  nom?: string;
  prenom?: string;
  nom_societe?: string;
}

export interface PostGroupeData {
  id: number;
  nom: string;
  type: string;
}

export interface PostPublicData {
  id: number;
  contenu: string;
  images: string[];
  videos: string[];
  audios: string[];
  documents: string[];
  visibility: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at: Date | null;
  created_at: Date;
  updated_at: Date;
  author?: PostAuthorData;
  groupe?: PostGroupeData;
  has_media: boolean;
  is_personal_post: boolean;
}

export interface PostDetailedData extends PostPublicData {
  posted_by_id: number;
  posted_by_type: string;
  groupe_id: number | null;
}

@Injectable()
export class PostMapper {
  /**
   * Transformer l'auteur (User ou Societe) en format API
   */
  mapAuthor(author: User | Societe | null | undefined): PostAuthorData | undefined {
    if (!author) return undefined;

    const isUser = 'prenom' in author;

    return {
      id: author.id,
      type: isUser ? 'User' : 'Societe',
      ...(isUser ? {
        nom: (author as User).nom,
        prenom: (author as User).prenom,
      } : {
        nom_societe: (author as Societe).nom_societe,
      }),
    };
  }

  /**
   * Transformer le groupe en format API
   */
  mapGroupe(groupe: Groupe | null | undefined): PostGroupeData | undefined {
    if (!groupe) return undefined;

    return {
      id: groupe.id,
      nom: groupe.nom,
      type: groupe.type,
    };
  }

  /**
   * Transformer un post en données publiques (sans infos sensibles)
   */
  toPublicData(
    post: Post,
    author?: User | Societe | null,
    groupe?: Groupe | null,
  ): PostPublicData {
    return {
      id: post.id,
      contenu: post.contenu,
      images: post.images || [],
      videos: post.videos || [],
      audios: post.audios || [],
      documents: post.documents || [],
      visibility: post.visibility,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      is_pinned: post.is_pinned,
      is_edited: post.is_edited,
      edited_at: post.edited_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: this.mapAuthor(author),
      groupe: this.mapGroupe(groupe),
      has_media: post.hasMedia(),
      is_personal_post: post.isPersonalPost(),
    };
  }

  /**
   * Transformer un post en données détaillées (avec infos polymorphiques)
   */
  toDetailedData(
    post: Post,
    author?: User | Societe | null,
    groupe?: Groupe | null,
  ): PostDetailedData {
    return {
      ...this.toPublicData(post, author, groupe),
      posted_by_id: post.posted_by_id,
      posted_by_type: post.posted_by_type,
      groupe_id: post.groupe_id,
    };
  }

  /**
   * Transformer une liste de posts pour le feed
   */
  toFeedData(
    postsWithAuthorsAndGroupes: Array<{
      post: Post;
      author?: User | Societe;
      groupe?: Groupe;
    }>,
  ): PostPublicData[] {
    return postsWithAuthorsAndGroupes.map(({ post, author, groupe }) =>
      this.toPublicData(post, author, groupe),
    );
  }

  /**
   * Transformer un post simple sans relations
   */
  toSimpleData(post: Post): Omit<PostPublicData, 'author' | 'groupe'> {
    return {
      id: post.id,
      contenu: post.contenu,
      images: post.images || [],
      videos: post.videos || [],
      audios: post.audios || [],
      documents: post.documents || [],
      visibility: post.visibility,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      is_pinned: post.is_pinned,
      is_edited: post.is_edited,
      edited_at: post.edited_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      has_media: post.hasMedia(),
      is_personal_post: post.isPersonalPost(),
    };
  }
}
