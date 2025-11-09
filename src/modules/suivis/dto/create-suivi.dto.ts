// modules/suivis/dto/create-suivi.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum FollowedType {
  USER = 'User',
  SOCIETE = 'Societe',
}

export class CreateSuiviDto {
  @IsNotEmpty()
  @IsInt()
  followed_id: number;

  @IsNotEmpty()
  @IsEnum(FollowedType)
  followed_type: FollowedType;

  @IsOptional()
  @IsBoolean()
  notifications_posts?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;
}
