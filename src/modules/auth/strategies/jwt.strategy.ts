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
    const { sub, userType } = payload;

    // Validation du type d'utilisateur
    if (!['user', 'societe'].includes(userType)) {
      throw new UnauthorizedException('Type d\'utilisateur invalide');
    }

    try {
      if (userType === 'user') {
        const user = await this.userService.findById(sub);
        // Retourne l'utilisateur avec son type pour les guards
        return { ...user, userType: 'user' };
      }

      if (userType === 'societe') {
        const societe = await this.societeService.findById(sub);
        // Retourne la société avec son type pour les guards
        return { ...societe, userType: 'societe' };
      }
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou utilisateur introuvable');
    }

    throw new UnauthorizedException('Type d\'utilisateur invalide');
  }
}
