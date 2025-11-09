// modules/suivis/dto/upgrade-to-abonnement.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { AbonnementPlan } from '../entities/abonnement.entity';

/**
 * DTO pour upgrade d'un suivi vers un abonnement
 * IMPORTANT: Seulement possible si on suit une Societe (pas un User)
 */
export class UpgradeToAbonnementDto {
  @IsNotEmpty()
  @IsInt()
  societe_id: number; // L'ID de la société qu'on suit déjà

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

  // Informations pour la PagePartenariat (créée automatiquement)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titre_partenariat?: string;

  @IsOptional()
  @IsString()
  description_partenariat?: string;
}
