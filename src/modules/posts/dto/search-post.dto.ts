// modules/posts/dto/search-post.dto.ts
import { IsOptional, IsString, IsInt, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PostVisibility } from '../entities/post.entity';

/**
 * DTO pour la recherche de posts
 * Utilisé par GET /posts/search/query
 *
 * @example
 * GET /posts/search/query?q=javascript&visibility=public&hasMedia=true
 * GET /posts/search/query?authorId=5&authorType=User
 * GET /posts/search/query?groupeId=10&isPinned=true
 */
export class SearchPostDto {
  /**
   * Terme de recherche dans le contenu du post
   * @example "javascript"
   */
  @IsOptional()
  @IsString()
  q?: string;

  /**
   * ID de l'auteur du post (User ou Societe)
   * @example 5
   */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  /**
   * Type d'auteur
   * @example "User" ou "Societe"
   */
  @IsOptional()
  @IsString()
  authorType?: string; // 'User' | 'Societe'

  /**
   * ID du groupe où le post a été publié
   * @example 10
   */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  groupeId?: number;

  /**
   * ID de la société où le post a été publié
   * @example 3
   */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  societeId?: number;

  /**
   * Niveau de visibilité du post
   * @example "public", "followers_only", "membres_only", "admins_only"
   */
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  /**
   * Filtrer uniquement les posts avec média (images, vidéos, audios, documents)
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasMedia?: boolean;

  /**
   * Filtrer uniquement les posts épinglés
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPinned?: boolean;

  /**
   * Date de début pour filtrer les posts (format ISO 8601)
   * @example "2025-01-01"
   */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /**
   * Date de fin pour filtrer les posts (format ISO 8601)
   * @example "2025-01-31"
   */
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
