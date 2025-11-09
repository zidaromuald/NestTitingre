// modules/posts/dto/create-commentaire.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsInt } from 'class-validator';

export class CreateCommentaireDto {
  @IsNotEmpty()
  @IsInt()
  post_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  contenu: string;

  // Ces champs seront remplis automatiquement par le contrôleur
  commentable_id?: number;
  commentable_type?: string;
}
