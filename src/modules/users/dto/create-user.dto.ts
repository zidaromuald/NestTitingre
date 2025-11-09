// modules/users/dto/create-user.dto.ts
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

export class CreateUserDto {
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
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'Le numéro doit contenir uniquement des chiffres',
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
}