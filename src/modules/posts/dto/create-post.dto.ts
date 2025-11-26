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
import { IsUploadedFile } from '../../../common/validators/is-uploaded-file.validator';

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
  @IsUploadedFile()
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUploadedFile()
  videos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUploadedFile()
  audios?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUploadedFile()
  documents?: string[];

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}
