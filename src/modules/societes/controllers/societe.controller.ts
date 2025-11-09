// modules/societes/controllers/societe.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SocieteService } from '../services/societe.service';
import { SearchSocieteDto } from '../dto/search-societe.dto';
import { SearchByNameDto } from '../dto/search-by-name.dto';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { AutocompleteDto } from '../dto/autocomplete.dto';

/**
 * SocieteController
 * Gère les opérations CRUD et recherches sur les sociétés
 * Toutes les routes sont protégées par JwtAuthGuard
 */
@Controller('societes')
@UseGuards(JwtAuthGuard) // Guard appliqué à toutes les routes
export class SocieteController {
  constructor(private readonly societeService: SocieteService) {}

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

  
}