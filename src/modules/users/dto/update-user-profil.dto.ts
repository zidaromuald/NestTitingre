// modules/users/dto/update-user-profil.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';

/**
 * DTO pour la mise à jour du profil utilisateur
 *
 * Note importante:
 * - nom et prenom sont récupérés depuis la table `users` lors de la création du compte
 * - Ils NE peuvent PAS être modifiés via ce DTO (lecture seule)
 * - photo est gérée via POST /users/me/photo
 *
 * Champs modifiables à tout moment:
 * - email (changement d'email)
 * - numero (numéro de téléphone)
 * - bio (présentation personnelle)
 * - experience (parcours professionnel)
 * - formation (études et diplômes)
 */
export class UpdateUserProfilDto {
  // Email - Modifiable depuis la table users
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(255)
  email?: string;

  // Numéro de téléphone - Modifiable depuis la table users
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  // Bio - Description personnelle (optionnelle)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  // Experience professionnelle (optionnelle)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  experience?: string;

  // Formation académique (optionnelle)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  formation?: string;
}
