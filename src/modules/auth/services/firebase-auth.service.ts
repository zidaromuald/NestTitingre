// modules/auth/services/firebase-auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/**
 * Service Firebase Authentication
 * Gère la vérification des tokens Firebase côté backend
 */
@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);
  private firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    this.initializeFirebase();
  }

  /**
   * Initialiser Firebase Admin SDK
   */
  private initializeFirebase() {
    try {
      // Option 1 : Utiliser le fichier de service account
      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        this.logger.log('✅ Firebase Admin SDK initialisé avec succès');
      } else {
        // Option 2 : Utiliser les variables d'environnement
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });

          this.logger.log('✅ Firebase Admin SDK initialisé avec variables d\'environnement');
        } else {
          this.logger.warn('⚠️  Firebase non configuré. Les fonctionnalités Firebase ne seront pas disponibles.');
        }
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'initialisation de Firebase', error.message);
    }
  }

  /**
   * Vérifier un token Firebase ID
   *
   * @param idToken - Token Firebase envoyé par le client Flutter
   * @returns DecodedIdToken contenant les informations de l'utilisateur
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      this.logger.log(`✅ Token Firebase vérifié pour l'utilisateur: ${decodedToken.uid}`);

      return decodedToken;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification du token Firebase', error.message);
      throw new UnauthorizedException('Token Firebase invalide ou expiré');
    }
  }

  /**
   * Obtenir les informations d'un utilisateur Firebase par son UID
   *
   * @param uid - UID Firebase de l'utilisateur
   * @returns UserRecord contenant les informations de l'utilisateur
   */
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(`❌ Utilisateur Firebase non trouvé: ${uid}`, error.message);
      throw new UnauthorizedException('Utilisateur Firebase non trouvé');
    }
  }

  /**
   * Obtenir les informations d'un utilisateur Firebase par son numéro de téléphone
   *
   * @param phoneNumber - Numéro de téléphone au format international (+XXX...)
   * @returns UserRecord contenant les informations de l'utilisateur
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
      return userRecord;
    } catch (error) {
      this.logger.error(`❌ Utilisateur Firebase non trouvé pour le numéro: ${phoneNumber}`, error.message);
      throw new UnauthorizedException('Numéro de téléphone non vérifié avec Firebase');
    }
  }

  /**
   * Créer un custom token Firebase pour un utilisateur
   * Utile si vous voulez créer un utilisateur Firebase depuis le backend
   *
   * @param uid - UID unique pour l'utilisateur
   * @param claims - Claims additionnels (optionnel)
   * @returns Custom token
   */
  async createCustomToken(uid: string, claims?: object): Promise<string> {
    try {
      const customToken = await admin.auth().createCustomToken(uid, claims);
      return customToken;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la création du custom token', error.message);
      throw error;
    }
  }

  /**
   * Vérifier si un numéro de téléphone est vérifié avec Firebase
   *
   * @param phoneNumber - Numéro de téléphone
   * @returns true si le numéro est vérifié, false sinon
   */
  async isPhoneNumberVerified(phoneNumber: string): Promise<boolean> {
    try {
      await this.getUserByPhoneNumber(phoneNumber);
      return true;
    } catch {
      return false;
    }
  }
}
