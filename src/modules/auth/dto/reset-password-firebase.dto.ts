// modules/auth/dto/reset-password-firebase.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO pour la réinitialisation de mot de passe avec Firebase Auth
 * L'utilisateur a déjà vérifié son téléphone via Firebase côté client
 */
export class ResetPasswordFirebaseDto {
  @IsNotEmpty({ message: 'Le token Firebase est requis' })
  @IsString()
  firebaseIdToken: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  newPassword: string;
}
