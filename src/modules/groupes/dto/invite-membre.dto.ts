// modules/groupes/dto/invite-membre.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { MembreRole } from '../entities/groupe.entity';

export class InviteMembreDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsEnum(MembreRole)
  role?: MembreRole; // Role à attribuer au membre invité (par défaut: MEMBRE)
}
