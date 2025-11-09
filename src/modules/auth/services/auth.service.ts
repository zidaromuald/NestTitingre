// modules/auth/services/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/user.service';
import { SocieteService } from '../../societes/services/societe.service';
import { UserMapper } from '../../users/mappers/user.mapper';
import { SocieteMapper } from '../../societes/mappers/societe.mapper';
import { RegisterUserDto } from '../dto/register.dto';
import { RegisterSocieteDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly societeService: SocieteService,
    private readonly userMapper: UserMapper,
    private readonly societeMapper: SocieteMapper,
    private readonly jwtService: JwtService,
  ) {}

  // ========== REGISTRATION ==========

  async registerUser(registerDto: RegisterUserDto) {
    const user = await this.userService.create(registerDto);
    const token = this.generateToken(user.id, 'user');

    return {
      message: 'Utilisateur créé avec succès',
      data: {
        user: this.userMapper.toAuthData(user),
        token,
        token_type: 'Bearer',
        user_type: 'user',
      },
    };
  }

  async registerSociete(registerDto: RegisterSocieteDto) {
    const societe = await this.societeService.create(registerDto);
    const token = this.generateToken(societe.id, 'societe');

    return {
      message: 'Société créée avec succès',
      data: {
        societe: this.societeMapper.toAuthData(societe),
        token,
        token_type: 'Bearer',
        id: societe.id,
        user_type: 'societe',
      },
    };
  }

  // ========== LOGIN ==========

  async loginUser(loginDto: LoginDto) {
    const user = await this.userService.validateUser(
      loginDto.identifiant,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
    }

    const token = this.generateToken(user.id, 'user');

    return {
      message: 'Connexion réussie',
      data: {
        user: this.userMapper.toAuthData(user),
        token,
        token_type: 'Bearer',
        user_type: 'user',
      },
    };
  }

  async loginSociete(loginDto: LoginDto) {
    const societe = await this.societeService.validateSociete(
      loginDto.identifiant,
      loginDto.password,
    );

    if (!societe) {
      throw new UnauthorizedException('Identifiant ou mot de passe incorrect');
    }

    const token = this.generateToken(societe.id, 'societe');

    return {
      message: 'Connexion réussie',
      data: {
        societe: this.societeMapper.toAuthData(societe),
        token,
        token_type: 'Bearer',
        userType: 'societe',
      },
    };
  }

  // ========== TOKEN GENERATION ==========

  private generateToken(userId: number, userType: 'user' | 'societe'): string {
    const payload: JwtPayload = {
      sub: userId,
      userType,
    };
    return this.jwtService.sign(payload);
  }
}