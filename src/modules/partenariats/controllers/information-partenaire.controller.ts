// modules/partenariats/controllers/information-partenaire.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InformationPartenaireService } from '../services/information-partenaire.service';
import { InformationPartenaireMapper } from '../mappers/information-partenaire.mapper';
import { CreateInformationPartenaireDto } from '../dto/create-information-partenaire.dto';
import { UpdateInformationPartenaireDto } from '../dto/update-information-partenaire.dto';

@Controller('informations-partenaires')
export class InformationPartenaireController {
  constructor(
    private readonly informationService: InformationPartenaireService,
    private readonly informationMapper: InformationPartenaireMapper,
  ) {}

  /**
   * Créer une information partenaire
   * POST /informations-partenaires
   */
  @Post()
  async createInformation(@Body() dto: CreateInformationPartenaireDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    const information = await this.informationService.createInformation(mockUserId, mockUserType, dto);
    return {
      success: true,
      message: 'Information partenaire créée avec succès',
      data: this.informationMapper.toPublicData(information),
    };
  }

  /**
   * Récupérer toutes les informations d'une page
   * GET /informations-partenaires/page/:pageId
   */
  @Get('page/:pageId')
  async getInformationsForPage(@Param('pageId', ParseIntPipe) pageId: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    const informations = await this.informationService.getInformationsForPage(pageId, mockUserId, mockUserType);
    const data = informations.map((i) => this.informationMapper.toPublicData(i));
    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer une information par ID
   * GET /informations-partenaires/:id
   */
  @Get(':id')
  async getInformationById(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    const information = await this.informationService.getInformationById(id, mockUserId, mockUserType);
    return {
      success: true,
      data: this.informationMapper.toPublicData(information),
    };
  }

  /**
   * Modifier une information (uniquement ses propres infos)
   * PUT /informations-partenaires/:id
   */
  @Put(':id')
  async updateInformation(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInformationPartenaireDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    const information = await this.informationService.updateInformation(id, mockUserId, mockUserType, dto);
    return {
      success: true,
      message: 'Information modifiée avec succès',
      data: this.informationMapper.toPublicData(information),
    };
  }

  /**
   * Supprimer une information (uniquement le créateur)
   * DELETE /informations-partenaires/:id
   */
  @Delete(':id')
  async deleteInformation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    await this.informationService.deleteInformation(id, mockUserId, mockUserType);
    return {
      success: true,
      message: 'Information supprimée avec succès',
    };
  }
}
