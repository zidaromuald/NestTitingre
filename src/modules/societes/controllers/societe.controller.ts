// modules/societes/controllers/societe.controller.ts
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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SocieteService } from '../services/societe.service';
import { SearchSocieteDto } from '../dto/search-societe.dto';
import { SearchByNameDto } from '../dto/search-by-name.dto';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { AutocompleteDto } from '../dto/autocomplete.dto';
import { UpdateSocieteProfilDto } from '../dto/update-societe-profil.dto';
import { Societe } from '../entities/societe.entity';
import { MediaService } from '../../media/services/media.service';
import { MediaType } from '../../media/enums/media-type.enum';
import { getMulterOptions } from '../../media/config/multer.config';

/**
 * SocieteController
 * Gère les opérations CRUD et recherches sur les sociétés
 * Toutes les routes sont protégées par JwtAuthGuard
 */
@Controller('societes')
@UseGuards(JwtAuthGuard) // Guard appliqué à toutes les routes
export class SocieteController {
  constructor(
    private readonly societeService: SocieteService,
    private readonly mediaService: MediaService,
  ) {}

  /**
   * GET /societes/search
   * Recherche de sociétés avec filtres
   */
  @Get('search')
  async search(@Query(ValidationPipe) searchDto: SearchSocieteDto) {
    const result = await this.societeService.search(searchDto);
    return {
      message: 'Recherche effectuée avec succès',
      ...result,
    };
  }

  /**
   * GET /societes/search-by-name
   * Recherche rapide par nom de société
   */
  @Get('search-by-name')
  async searchByName(@Query(ValidationPipe) dto: SearchByNameDto) {
    const data = await this.societeService.searchByName(dto.q);
    return {
      message: 'Recherche effectuée avec succès',
      data,
    };
  }

  /**
   * GET /societes/advanced-search
   * Recherche avancée avec plusieurs critères
   */
  @Get('advanced-search')
  async advancedSearch(@Query(ValidationPipe) searchDto: AdvancedSearchDto) {
    const result = await this.societeService.advancedSearch(searchDto);
    return {
      message: 'Recherche avancée effectuée avec succès',
      ...result,
    };
  }

  /**
   * GET /societes/autocomplete
   * Autocomplétion pour la recherche rapide
   */
  @Get('autocomplete')
  async autocomplete(@Query(ValidationPipe) dto: AutocompleteDto) {
    const data = await this.societeService.autocomplete(dto.term);
    return {
      message: 'Autocomplétion effectuée avec succès',
      data,
    };
  }

  /**
   * GET /societes/filters
   * Récupère les listes de filtres disponibles
   * (secteurs, produits, centres d'intérêt)
   */
  @Get('filters')
  async getFilters() {
    const data = await this.societeService.getFilters();
    return {
      message: 'Filtres récupérés avec succès',
      data,
    };
  }

  // ==================== ROUTES DE PROFIL ====================

  /**
   * Récupérer le profil de la société connectée
   * GET /societes/me
   */
  @Get('me')
  async getMyProfile(@CurrentUser() societe: Societe) {
    const { societe: societeData, profile } = await this.societeService.getProfile(societe.id);

    return {
      success: true,
      message: 'Profil récupéré avec succès',
      data: {
        ...societeData,
        profile,
      },
    };
  }

  /**
   * Récupérer les statistiques de ma société
   * GET /societes/me/stats
   */
  @Get('me/stats')
  async getMyStats(@CurrentUser() societe: Societe) {
    const stats = await this.societeService.getProfileStats(societe.id);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Mettre à jour mon profil société
   * PUT /societes/me/profile
   */
  @Put('me/profile')
  async updateMyProfile(
    @CurrentUser() societe: Societe,
    @Body() updateDto: UpdateSocieteProfilDto,
  ) {
    const profile = await this.societeService.updateProfile(societe.id, updateDto);

    return {
      success: true,
      message: 'Profil mis à jour avec succès',
      data: profile,
    };
  }

  /**
   * Uploader un logo de société
   * POST /societes/me/logo
   */
  @Post('me/logo')
  @UseInterceptors(FileInterceptor('file', getMulterOptions(MediaType.IMAGE)))
  async uploadLogo(
    @CurrentUser() societe: Societe,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Upload via MediaService
    const uploadResult = await this.mediaService.handleUpload(file, MediaType.IMAGE);

    // Mettre à jour le profil avec l'URL du logo
    const profile = await this.societeService.updateLogo(
      societe.id,
      uploadResult.data.url,
    );

    return {
      success: true,
      message: 'Logo mis à jour avec succès',
      data: {
        logo: profile.logo,
        url: uploadResult.data.url,
      },
    };
  }

  /**
   * Récupérer le profil d'une société par ID
   * GET /societes/:id
   */
  @Get(':id')
  async getSocieteProfile(@Param('id', ParseIntPipe) id: number) {
    const { societe: societeData, profile } = await this.societeService.getProfile(id);

    return {
      success: true,
      data: {
        ...societeData,
        profile,
      },
    };
  }

  /**
   * Récupérer les statistiques d'une société
   * GET /societes/:id/stats
   */
  @Get(':id/stats')
  async getSocieteStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.societeService.getProfileStats(id);

    return {
      success: true,
      data: stats,
    };
  }
}