// modules/auth/dto/register-with-firebase.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { WEST_AFRICA_PHONE_REGEX, WEST_AFRICA_PHONE_ERROR_MESSAGE } from '../../../common/validators/phone-number.validator';

/**
 * DTO pour l'inscription avec Firebase Authentication
 *
 * Ce DTO est utilisé quand le numéro de téléphone a déjà été vérifié
 * avec Firebase. Le backend vérifie le token Firebase et crée le compte.
 */
export class RegisterWithFirebaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  prenom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(WEST_AFRICA_PHONE_REGEX, {
    message: WEST_AFRICA_PHONE_ERROR_MESSAGE,
  })
  numero: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  activite?: string;

  @IsDateString()
  @IsNotEmpty()
  date_naissance: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  password_confirmation: string;

  /**
   * Token Firebase ID obtenu après vérification du numéro
   * Ce token prouve que le numéro a été vérifié avec Firebase
   */
  @IsString()
  @IsNotEmpty()
  firebaseIdToken: string;
}
