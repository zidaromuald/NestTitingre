// modules/societes/dto/create-societe.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateSocieteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom_societe: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'Le numéro doit contenir uniquement des chiffres',
  })
  numero: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  centre_interet: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  secteur_activite: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  type_produit: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  adresse?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  password_confirmation: string;
}
