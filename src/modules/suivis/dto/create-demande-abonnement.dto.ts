// modules/suivis/dto/create-demande-abonnement.dto.ts
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
 * DTO pour créer une demande d'abonnement DIRECT
 * User clique "S'ABONNER" sans avoir suivi la société d'abord
 */
export class CreateDemandeAbonnementDto {
  @IsNotEmpty()
  @IsInt()
  societe_id: number;

  @IsOptional()
  @IsEnum(AbonnementPlan)
  plan_demande?: AbonnementPlan;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  secteur_collaboration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role_utilisateur?: string;

  // Informations pour la PagePartenariat (créée automatiquement si acceptée)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titre_partenariat?: string;

  @IsOptional()
  @IsString()
  description_partenariat?: string;

  // Message de motivation
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
