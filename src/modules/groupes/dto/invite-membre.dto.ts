// modules/groupes/dto/invite-membre.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsEnum, IsIn } from 'class-validator';
import { MembreRole } from '../entities/groupe.entity';

export class InviteMembreDto {
  @IsNotEmpty()
  @IsInt()
  invitedId: number; // Renommé de userId pour plus de clarté

  @IsNotEmpty()
  @IsString()
  @IsIn(['User', 'Societe'], { message: 'invitedType doit être "User" ou "Societe"' })
  invitedType: string; // 'User' ou 'Societe'

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsEnum(MembreRole)
  role?: MembreRole; // Role à attribuer au membre invité (par défaut: MEMBRE)
}
