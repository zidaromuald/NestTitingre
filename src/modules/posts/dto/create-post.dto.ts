// modules/posts/dto/create-post.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostDto {
  @IsOptional()
  @IsInt()
  @ValidateIf((o) => !o.societe_id) // Groupe OU Société, pas les deux
  groupe_id?: number;

  @IsOptional()
  @IsInt()
  @ValidateIf((o) => !o.groupe_id) // Groupe OU Société, pas les deux
  societe_id?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  contenu: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audios?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  // Ces champs seront remplis automatiquement par le contrôleur
  // en fonction de l'utilisateur ou société connecté(e)
  posted_by_id?: number;
  posted_by_type?: string;
}
