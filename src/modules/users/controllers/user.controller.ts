// modules/users/controllers/user.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserService } from '../services/user.service';
import { SearchUserDto } from '../dto/search-user.dto';
import { AutocompleteDto } from '../dto/autocomplete.dto';
import { UpdateUserProfilDto } from '../dto/update-user-profil.dto';
import { User } from '../entities/user.entity';
import { MediaService } from '../../media/services/media.service';
import { MediaType } from '../../media/enums/media-type.enum';
import { getFastifyUploadOptions } from '../../media/config/fastify-upload.config';
import { FastifyFileInterceptorFactory } from '../../../common/interceptors/fastify-file.interceptor';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('search')
  async search(
    @Query(ValidationPipe) searchDto: SearchUserDto,
    @CurrentUser('id') currentUserId: number,
  ) {
    const result = await this.userService.search(searchDto, currentUserId);
    return {
      message: 'Recherche effectuée avec succès',
      ...result,
    };
  }

  @Get('autocomplete')
  async autocomplete(
    @Query(ValidationPipe) dto: AutocompleteDto,
    @CurrentUser('id') currentUserId: number,
  ) {
    const data = await this.userService.autocomplete(dto.term, currentUserId);
    return {
      message: 'Autocomplétion effectuée avec succès',
      data,
    };
  }

  // ==================== ROUTES DE PROFIL ====================

  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /users/me
   */
  @Get('me')
  async getMyProfile(@CurrentUser() user: User) {
    const { user: userData, profile } = await this.userService.getProfile(user.id);

    return {
      success: true,
      message: 'Profil récupéré avec succès',
      data: {
        ...userData,
        profile,
      },
    };
  }

  /**
   * Récupérer les statistiques de mon profil
   * GET /users/me/stats
   */
  @Get('me/stats')
  async getMyStats(@CurrentUser() user: User) {
    const stats = await this.userService.getProfileStats(user.id);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Mettre à jour mon profil
   * PUT /users/me/profile
   */
  @Put('me/profile')
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateUserProfilDto,
  ) {
    const profile = await this.userService.updateProfile(user.id, updateDto);

    return {
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profile,
    };
  }

  /**
   * Uploader une photo de profil
   * POST /users/me/photo
   */
  @Post('me/photo')
  @UseInterceptors(
    FastifyFileInterceptorFactory('file', getFastifyUploadOptions(MediaType.IMAGE)),
  )
  async uploadProfilePhoto(
    @CurrentUser() user: User,
    @Req() request: FastifyRequest,
  ) {
    const file = (request as any).file;
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Upload via MediaService
    const uploadResult = await this.mediaService.handleUpload(file, MediaType.IMAGE);

    // Mettre à jour le profil avec l'URL de la photo
    const profile = await this.userService.updateProfilePhoto(
      user.id,
      uploadResult.data.url,
    );

    return {
      success: true,
      message: 'Photo de profil mise à jour avec succès',
      data: {
        photo: profile.photo,
        url: uploadResult.data.url,
      },
    };
  }

  /**
   * Récupérer le profil d'un utilisateur par ID
   * GET /users/:id
   */
  @Get(':id')
  async getUserProfile(@Param('id', ParseIntPipe) id: number) {
    const { user: userData, profile } = await this.userService.getProfile(id);

    return {
      success: true,
      data: {
        ...userData,
        profile,
      },
    };
  }

  /**
   * Récupérer les statistiques d'un utilisateur
   * GET /users/:id/stats
   */
  @Get(':id/stats')
  async getUserStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.userService.getProfileStats(id);

    return {
      success: true,
      data: stats,
    };
  }
}
