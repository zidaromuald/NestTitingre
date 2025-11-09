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
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserType } from '../../../common/decorators/user-type.decorator';
import { UserTypeGuard } from '../../../common/guards/user-type.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RegisterUserDto, RegisterSocieteDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ========== USER ROUTES ==========

  @Post('register')
  async registerUser(@Body(ValidationPipe) registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async loginUser(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
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
