// modules/partenariats/dto/update-information-partenaire.dto.ts
import { IsOptional, IsString, IsInt, IsEnum, IsDateString, IsDecimal, IsArray, IsBoolean } from 'class-validator';
import { ModifiablePar } from '../entities/information-partenaire.entity';

export class UpdateInformationPartenaireDto {
  @IsOptional()
  @IsString()
  nom_affichage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  localite?: string;

  @IsOptional()
  @IsString()
  adresse_complete?: string;

  @IsOptional()
  @IsString()
  numero_telephone?: string;

  @IsOptional()
  @IsString()
  email_contact?: string;

  @IsOptional()
  @IsString()
  secteur_activite?: string;

  // Agriculture
  @IsOptional()
  @IsString()
  superficie?: string;

  @IsOptional()
  @IsString()
  type_culture?: string;

  @IsOptional()
  @IsString()
  maison_etablissement?: string;

  @IsOptional()
  @IsString()
  contact_controleur?: string;

  // Entreprise
  @IsOptional()
  @IsString()
  siege_social?: string;

  @IsOptional()
  @IsDateString()
  date_creation?: string;

  @IsOptional()
  @IsArray()
  certificats?: string[];

  @IsOptional()
  @IsString()
  numero_registration?: string;

  @IsOptional()
  @IsDecimal()
  capital_social?: number;

  @IsOptional()
  @IsDecimal()
  chiffre_affaires?: number;

  // Commun
  @IsOptional()
  @IsInt()
  nombre_employes?: number;

  @IsOptional()
  @IsString()
  type_organisation?: string;

  @IsOptional()
  @IsEnum(ModifiablePar)
  modifiable_par?: ModifiablePar;

  @IsOptional()
  @IsBoolean()
  visible_sur_page?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
