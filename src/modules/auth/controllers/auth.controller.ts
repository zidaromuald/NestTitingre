// modules/auth/controllers/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserType } from '../../../common/decorators/user-type.decorator';
import { UserTypeGuard } from '../../../common/guards/user-type.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RegisterUserDto, RegisterSocieteDto } from '../dto/register.dto';
import { RegisterWithFirebaseDto } from '../dto/register-with-firebase.dto';
import { ResetPasswordFirebaseDto } from '../dto/reset-password-firebase.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { PasswordResetService } from '../services/password-reset.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ========== USER ROUTES ==========

  @Post('register')
  async registerUser(@Body(ValidationPipe) registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('register-firebase')
  async registerWithFirebase(
    @Body(ValidationPipe) dto: RegisterWithFirebaseDto,
  ) {
    // Vérifier le token Firebase
    const decodedToken = await this.firebaseAuthService.verifyIdToken(
      dto.firebaseIdToken,
    );

    // Vérifier que le numéro correspond
    if (decodedToken.phone_number !== dto.numero) {
      throw new BadRequestException(
        'Le numéro de téléphone ne correspond pas au token Firebase',
      );
    }

    // Vérifier si password et password_confirmation correspondent
    if (dto.password !== dto.password_confirmation) {
      throw new BadRequestException(
        'Le mot de passe et sa confirmation ne correspondent pas',
      );
    }

    // Vérifier si le numéro existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { numero: dto.numero },
    });

    if (existingUser) {
      throw new BadRequestException('Ce numéro de téléphone est déjà utilisé');
    }

    // Créer le compte (numéro déjà vérifié par Firebase)
    const user = this.userRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      numero: dto.numero,
      email: dto.email,
      activite: dto.activite,
      date_naissance: new Date(dto.date_naissance),
      password: await bcrypt.hash(dto.password, 10),
      is_phone_verified: true, // ✅ Déjà vérifié par Firebase
      phone_verified_at: new Date(),
    });

    await this.userRepository.save(user);

    // Générer token JWT
    const payload = {
      sub: user.id,
      userType: 'user',
    };
    const token = this.jwtService.sign(payload);

    return {
      status: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          numero: user.numero,
          is_phone_verified: true,
        },
        token,
        token_type: 'Bearer',
        user_type: 'user',
      },
    };
  }

  @Post('login')
  async loginUser(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordFirebaseDto) {
    return this.passwordResetService.resetPasswordWithFirebase(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('user')
  async getMe(@CurrentUser() user: User) {
    return {
      message: 'Informations utilisateur récupérées',
      data: user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('user')
  async logout() {
    // Note: Avec JWT, la déconnexion est gérée côté client
    // Pour une vraie déconnexion, il faudrait blacklister le token
    return {
      message: 'Déconnexion réussie',
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('user')
  async logoutAll() {
    // Similaire à logout, nécessiterait un système de blacklist de tokens
    return {
      message: 'Déconnexion de tous les appareils réussie',
    };
  }

  // ========== SOCIETE ROUTES ==========

  @Post('societe/register')
  async registerSociete(
    @Body(ValidationPipe) registerDto: RegisterSocieteDto,
  ) {
    return this.authService.registerSociete(registerDto);
  }

  @Post('societe/login')
  async loginSociete(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.loginSociete(loginDto);
  }

  @Get('societe/me')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('societe')
  async getSocieteMe(@CurrentUser() societe: Societe) {
    return {
      message: 'Informations société récupérées',
      data: societe,
    };
  }

  @Post('societe/logout')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('societe')
  async logoutSociete() {
    return {
      message: 'Déconnexion réussie',
    };
  }

  @Post('societe/logout-all')
  @UseGuards(JwtAuthGuard, UserTypeGuard)
  @UserType('societe')
  async logoutAllSociete() {
    return {
      message: 'Déconnexion de tous les appareils réussie',
    };
  }
}
