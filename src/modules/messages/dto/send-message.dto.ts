// modules/messages/dto/send-message.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsInt, IsEnum, IsArray } from 'class-validator';
import { MessageCollaborationType } from '../entities/message-collaboration.entity';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  contenu: string;

  @IsOptional()
  @IsArray()
  fichiers?: string[];

  @IsOptional()
  @IsEnum(MessageCollaborationType)
  type?: MessageCollaborationType;

  @IsOptional()
  @IsInt()
  transaction_collaboration_id?: number;

  @IsOptional()
  @IsInt()
  abonnement_id?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
