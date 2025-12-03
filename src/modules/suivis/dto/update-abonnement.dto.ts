// modules/suivis/dto/update-abonnement.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';
import { AbonnementPlan } from '../entities/abonnement.entity';

/**
 * DTO pour mettre à jour un abonnement existant
 * L'utilisateur peut modifier son plan, son secteur, son rôle et ses permissions
 */
export class UpdateAbonnementDto {
  @IsOptional()
  @IsEnum(AbonnementPlan)
  plan_collaboration?: AbonnementPlan;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  secteur_collaboration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role_utilisateur?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
