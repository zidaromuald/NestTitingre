// modules/groupes/dto/invite-membre.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class InviteMembreDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
