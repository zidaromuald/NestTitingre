// modules/suivis/controllers/suivre.controller.ts
import { Controller, Get, Post, Delete, Put, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SuivreService } from '../services/suivre.service';
import { SuivreMapper } from '../mappers/suivre.mapper';
import { SuivrePolymorphicService } from '../services/suivre-polymorphic.service';
import { CreateSuiviDto } from '../dto/create-suivi.dto';
import { UpdateSuiviDto } from '../dto/update-suivi.dto';
import { UpgradeToAbonnementDto } from '../dto/upgrade-to-abonnement.dto';

@Controller('suivis')
export class SuivreController {
  constructor(
    private readonly suivreService: SuivreService,
    private readonly suivreMapper: SuivreMapper,
    private readonly suivrePolymorphicService: SuivrePolymorphicService,
  ) {}

  /**
   * Suivre une entité (User ou Societe)
   * POST /suivis
   */
  @Post()
  async suivre(@Body() createSuiviDto: CreateSuiviDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const suivre = await this.suivreService.suivre(mockUserId, mockUserType, createSuiviDto);
    const followed = await this.suivrePolymorphicService.getFollowedEntity(suivre);
    return { success: true, message: `Vous suivez maintenant ${createSuiviDto.followed_type === 'User' ? 'cet utilisateur' : 'cette société'}`, data: this.suivreMapper.toPublicData(suivre, followed!) };
  }

  /**
   * Ne plus suivre
   * DELETE /suivis/:type/:id
   */
  @Delete(':type/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(@Param('type') type: string, @Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    await this.suivreService.unfollow(mockUserId, mockUserType, id, type);
    return { success: true, message: 'Vous ne suivez plus cette entité' };
  }

  /**
   * Mettre à jour les préférences
   * PUT /suivis/:type/:id
   */
  @Put(':type/:id')
  async updateSuivi(@Param('type') type: string, @Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateSuiviDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const suivre = await this.suivreService.updateSuivi(mockUserId, mockUserType, id, type, updateDto);
    return { success: true, message: 'Préférences mises à jour', data: this.suivreMapper.toPublicData(suivre) };
  }

  /**
   * Vérifier si suit
   * GET /suivis/:type/:id/check
   */
  @Get(':type/:id/check')
  async checkSuivi(@Param('type') type: string, @Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const isSuivant = await this.suivreService.isSuivant(mockUserId, mockUserType, id, type);
    return { success: true, data: { is_suivant: isSuivant } };
  }

  /**
   * Récupérer mes suivis
   * GET /suivis/my-following?type=User|Societe
   */
  @Get('my-following')
  async getMyFollowing(@Query('type') type?: string) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const suivres = await this.suivreService.getUserSuivis(mockUserId, mockUserType, type);
    const data = suivres.map(s => this.suivreMapper.toPublicData(s));
    return { success: true, data, meta: { count: data.length, type: type || 'all' } };
  }

  /**
   * Récupérer les followers
   * GET /suivis/:type/:id/followers
   */
  @Get(':type/:id/followers')
  async getFollowers(@Param('type') type: string, @Param('id', ParseIntPipe) id: number) {
    const suivres = await this.suivreService.getFollowers(id, type);
    const data = suivres.map(s => ({
      user_id: s.user_id,
      user_type: s.user_type,
      score_engagement: s.calculerScoreEngagement(),
      suivi_depuis: s.created_at
    }));
    return { success: true, data, meta: { count: data.length } };
  }

  /**
   * Upgrade vers abonnement (UNIQUEMENT pour Societe)
   * POST /suivis/upgrade-to-abonnement
   */
  @Post('upgrade-to-abonnement')
  async upgradeToAbonnement(@Body() upgradeDto: UpgradeToAbonnementDto) {
    const mockUserId = 1;
    const { abonnement, pagePartenariat } = await this.suivreService.upgradeToAbonnement(mockUserId, upgradeDto);
    return {
      success: true,
      message: 'Abonnement créé avec succès. Votre page partenariat est disponible.',
      data: {
        abonnement: { id: abonnement.id, statut: abonnement.statut, plan_collaboration: abonnement.plan_collaboration },
        page_partenariat: { id: pagePartenariat.id, titre: pagePartenariat.titre, visibilite: pagePartenariat.visibilite },
      },
    };
  }

  /**
   * Statistiques société
   * GET /suivis/societe/:id/stats
   */
  @Get('societe/:id/stats')
  async getSocieteStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.suivreService.getSocieteStats(id);
    return { success: true, data: stats };
  }
}
