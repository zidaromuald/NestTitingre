// modules/partenariats/controllers/information-partenaire.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InformationPartenaireService } from '../services/information-partenaire.service';
import { InformationPartenaireMapper } from '../mappers/information-partenaire.mapper';
import { CreateInformationPartenaireDto } from '../dto/create-information-partenaire.dto';
import { UpdateInformationPartenaireDto } from '../dto/update-information-partenaire.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Controller('informations-partenaires')
@UseGuards(JwtAuthGuard)
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
  async createInformation(
    @Body() dto: CreateInformationPartenaireDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';
    const information = await this.informationService.createInformation(userId, userType, dto);
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
  async getInformationsForPage(
    @Param('pageId', ParseIntPipe) pageId: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';
    const informations = await this.informationService.getInformationsForPage(pageId, userId, userType);
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
  async getInformationById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';
    const information = await this.informationService.getInformationById(id, userId, userType);
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
  async updateInformation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInformationPartenaireDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';
    const information = await this.informationService.updateInformation(id, userId, userType, dto);
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
  async deleteInformation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';
    await this.informationService.deleteInformation(id, userId, userType);
    return {
      success: true,
      message: 'Information supprimée avec succès',
    };
  }
}
