// modules/suivis/dto/create-invitation-suivi.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';

export enum InvitationTargetType {
  USER = 'User',
  SOCIETE = 'Societe',
}

export class CreateInvitationSuiviDto {
  @IsNotEmpty()
  @IsInt()
  target_id: number;

  @IsNotEmpty()
  @IsEnum(InvitationTargetType)
  target_type: InvitationTargetType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
