// modules/suivis/dto/create-invitation-suivi.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';

export enum InvitationReceiverType {
  USER = 'User',
  SOCIETE = 'Societe',
}

export class CreateInvitationSuiviDto {
  @IsNotEmpty()
  @IsInt()
  receiver_id: number;

  @IsNotEmpty()
  @IsEnum(InvitationReceiverType)
  receiver_type: InvitationReceiverType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
