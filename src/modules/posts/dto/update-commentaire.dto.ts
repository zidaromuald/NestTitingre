// modules/posts/dto/update-commentaire.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateCommentaireDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  contenu: string;
}
