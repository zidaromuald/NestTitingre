// modules/auth/services/password-reset.service.ts
import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { FirebaseAuthService } from './firebase-auth.service';
import { ResetPasswordFirebaseDto } from '../dto/reset-password-firebase.dto';

/**
 * Service de réinitialisation de mot de passe via Firebase Auth
 * Flux: Client vérifie téléphone avec Firebase → Backend reçoit token → Update password
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  /**
   * Réinitialise le mot de passe avec Firebase Auth
   * POST /auth/password-reset
   */
  async resetPasswordWithFirebase(
    dto: ResetPasswordFirebaseDto,
  ): Promise<{ message: string }> {
    // 1. Vérifier le token Firebase
    const decodedToken = await this.firebaseAuthService.verifyIdToken(
      dto.firebaseIdToken,
    );

    // 2. Extraire le numéro de téléphone du token Firebase
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      throw new NotFoundException(
        'Le token Firebase ne contient pas de numéro de téléphone',
      );
    }

    this.logger.log(
      `🔐 Demande de reset password pour: ${this.maskPhoneNumber(phoneNumber)}`,
    );

    // 3. Trouver l'utilisateur ou la société par numéro de téléphone
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.numero = :numero', { numero: phoneNumber })
      .getOne();

    const societe = await this.societeRepository
      .createQueryBuilder('societe')
      .where('societe.numero = :numero', { numero: phoneNumber })
      .getOne();

    if (!user && !societe) {
      throw new NotFoundException(
        'Aucun compte trouvé avec ce numéro de téléphone',
      );
    }

    // 4. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 5. Mettre à jour le mot de passe
    if (user) {
      user.password = hashedPassword;
      await this.userRepository.save(user);
      this.logger.log(
        `✅ Mot de passe réinitialisé pour User ID: ${user.id}`,
      );
    } else if (societe) {
      societe.password = hashedPassword;
      await this.societeRepository.save(societe);
      this.logger.log(
        `✅ Mot de passe réinitialisé pour Societe ID: ${societe.id}`,
      );
    }

    return {
      message: 'Votre mot de passe a été réinitialisé avec succès',
    };
  }

  /**
   * Masque le numéro de téléphone pour les logs
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 4) return '****';
    return phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
  }
}
