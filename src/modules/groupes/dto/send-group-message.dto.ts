// modules/groupes/dto/send-group-message.dto.ts
import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';
import { MessageGroupeType } from '../entities/message-groupe.entity';
import { IsUploadedFile } from '../../../common/validators/is-uploaded-file.validator';

export class SendGroupMessageDto {
  @IsString()
  @MaxLength(10000, { message: 'Le message ne peut pas dépasser 10000 caractères' })
  contenu: string;

  @IsOptional()
  @IsEnum(MessageGroupeType)
  type?: MessageGroupeType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUploadedFile()
  fichiers?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
