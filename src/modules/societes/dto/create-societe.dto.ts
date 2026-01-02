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
import { WEST_AFRICA_PHONE_REGEX, WEST_AFRICA_PHONE_ERROR_MESSAGE } from '../../../common/validators/phone-number.validator';

export class CreateSocieteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom_societe: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(WEST_AFRICA_PHONE_REGEX, {
    message: WEST_AFRICA_PHONE_ERROR_MESSAGE,
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
