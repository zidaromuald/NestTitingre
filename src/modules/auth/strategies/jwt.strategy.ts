// modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/services/user.service';
import { SocieteService } from '../../societes/services/societe.service';

export interface JwtPayload {
  sub: number;
  userType: 'user' | 'societe';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly societeService: SocieteService,
  ) {
    const jwtSecret = configService.get<string>('jwt.secret');

    // Validation stricte: Lance une erreur si JWT_SECRET est manquant
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET est requis. Veuillez définir JWT_SECRET dans votre fichier .env',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('=== JWT STRATEGY DEBUG ===');
    console.log('JWT Payload:', payload);

    const { sub, userType } = payload;

    // Validation du type d'utilisateur
    if (!['user', 'societe'].includes(userType)) {
      console.log('JWT ERROR: Type d\'utilisateur invalide:', userType);
      throw new UnauthorizedException('Type d\'utilisateur invalide');
    }

    try {
      if (userType === 'user') {
        const user = await this.userService.findById(sub);
        console.log('JWT SUCCESS: User trouvé:', { id: user.id, nom: user.nom });
        // Retourne l'utilisateur avec le userType ajouté
        return { ...user, userType: 'user' };
      }

      if (userType === 'societe') {
        const societe = await this.societeService.findById(sub);
        console.log('JWT SUCCESS: Societe trouvée:', { id: societe.id, nom_societe: societe.nom_societe });
        // Retourne la société avec le userType ajouté
        return { ...societe, userType: 'societe' };
      }
    } catch (error) {
      console.log('JWT ERROR: Erreur lors de la recherche de l\'utilisateur:', error.message);
      throw new UnauthorizedException('Token invalide ou utilisateur introuvable');
    }

    console.log('JWT ERROR: Type d\'utilisateur invalide (fin)');
    throw new UnauthorizedException('Type d\'utilisateur invalide');
  }
}
