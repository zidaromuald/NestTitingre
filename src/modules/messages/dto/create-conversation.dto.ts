// modules/messages/dto/create-conversation.dto.ts
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsInt()
  participant2_id: number;

  @IsNotEmpty()
  @IsString()
  participant2_type: string; // 'User' ou 'Societe'

  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
