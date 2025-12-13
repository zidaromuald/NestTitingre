// modules/groupes/dto/update-group-message.dto.ts
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';
import { IsUploadedFile } from '../../../common/validators/is-uploaded-file.validator';

export class UpdateGroupMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000, { message: 'Le message ne peut pas dépasser 10000 caractères' })
  contenu?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUploadedFile()
  fichiers?: string[];
}
