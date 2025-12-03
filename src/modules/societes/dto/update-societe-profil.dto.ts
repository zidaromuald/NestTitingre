// modules/societes/dto/update-societe-profil.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsEmail,
  Matches,
} from 'class-validator';

export class UpdateSocieteProfilDto {
  // Note: Le logo est géré séparément via POST /societes/me/logo
  // pour assurer validation et sécurité des uploads de fichiers

  @IsOptional()
  @IsString()
  @MaxLength(255)
  secteur_activite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taille_entreprise?: string; // Ex: "PME", "ETI", "Grande entreprise"

  @IsOptional()
  @IsInt()
  @Min(1)
  nombre_employes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  chiffre_affaires?: number;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  annee_creation?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adresse_complete?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ville?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  pays?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9]{5}$/, {
    message: 'Code postal doit contenir 5 chiffres',
  })
  code_postal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'Le numéro doit contenir uniquement des chiffres',
  })
  telephone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email_contact?: string;
}
