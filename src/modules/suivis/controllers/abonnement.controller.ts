// modules/suivis/controllers/abonnement.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AbonnementService } from '../services/abonnement.service';
import { AbonnementMapper } from '../mappers/abonnement.mapper';
import { UpdateAbonnementDto } from '../dto/update-abonnement.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { AbonnementStatut } from '../entities/abonnement.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('abonnements')
@UseGuards(JwtAuthGuard)
export class AbonnementController {
  constructor(
    private readonly abonnementService: AbonnementService,
    private readonly abonnementMapper: AbonnementMapper,
  ) {}

  /**
   * Récupérer mes abonnements (en tant qu'utilisateur)
   * GET /abonnements/my-subscriptions?statut=active
   */
  @Get('my-subscriptions')
  async getMyAbonnements(
    @Query('statut') statut?: AbonnementStatut,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Endpoint réservé aux utilisateurs');
    }

    const abonnements = await this.abonnementService.getMyAbonnements(user.id, statut);
    const data = this.abonnementMapper.toList(abonnements);

    return {
      success: true,
      data,
      meta: {
        count: data.length,
        statut: statut || 'all',
      },
    };
  }

  /**
   * Récupérer mes abonnés (en tant que société)
   * GET /abonnements/my-subscribers?statut=active
   */
  @Get('my-subscribers')
  async getMyAbonnes(
    @Query('statut') statut?: AbonnementStatut,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Endpoint réservé aux sociétés');
    }

    const abonnements = await this.abonnementService.getMyAbonnes(user.id, statut);
    const data = this.abonnementMapper.toList(abonnements);

    return {
      success: true,
      data,
      meta: {
        count: data.length,
        statut: statut || 'all',
      },
    };
  }

  /**
   * Vérifier si je suis abonné à une société
   * GET /abonnements/check/:societeId
   */
  @Get('check/:societeId')
  async checkAbonnement(
    @Param('societeId', ParseIntPipe) societeId: number,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Endpoint réservé aux utilisateurs');
    }

    const isAbonne = await this.abonnementService.isAbonne(user.id, societeId);

    return {
      success: true,
      data: { is_abonne: isAbonne },
    };
  }

  /**
   * Récupérer un abonnement spécifique
   * GET /abonnements/:id
   */
  @Get(':id')
  async getAbonnementById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const abonnement = await this.abonnementService.getAbonnementById(id);

    // Vérifier les permissions (user ou societe de cet abonnement)
    if (user.userType === 'user' && abonnement.user_id !== user.id) {
      throw new UnauthorizedException('Vous ne pouvez pas accéder à cet abonnement');
    }
    if (user.userType === 'societe' && abonnement.societe_id !== user.id) {
      throw new UnauthorizedException('Vous ne pouvez pas accéder à cet abonnement');
    }

    return {
      success: true,
      data: this.abonnementMapper.toPublicData(abonnement),
    };
  }

  /**
   * Mettre à jour un abonnement
   * PUT /abonnements/:id
   */
  @Put(':id')
  async updateAbonnement(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAbonnementDto,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Seuls les utilisateurs peuvent modifier leurs abonnements');
    }

    const abonnement = await this.abonnementService.updateAbonnement(id, user.id, updateDto);

    return {
      success: true,
      message: 'Abonnement mis à jour avec succès',
      data: this.abonnementMapper.toPublicData(abonnement),
    };
  }

  /**
   * Mettre à jour les permissions
   * PUT /abonnements/:id/permissions
   */
  @Put(':id/permissions')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionsDto,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Seuls les utilisateurs peuvent modifier leurs permissions');
    }

    const abonnement = await this.abonnementService.updatePermissions(id, user.id, updateDto.permissions);

    return {
      success: true,
      message: 'Permissions mises à jour avec succès',
      data: this.abonnementMapper.toPublicData(abonnement),
    };
  }

  /**
   * Suspendre un abonnement
   * PUT /abonnements/:id/suspend
   */
  @Put(':id/suspend')
  async suspendreAbonnement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const actorType = user.userType === 'user' ? 'user' : 'societe';
    const abonnement = await this.abonnementService.suspendreAbonnement(id, user.id, actorType);

    return {
      success: true,
      message: 'Abonnement suspendu avec succès',
      data: this.abonnementMapper.toMinimalData(abonnement),
    };
  }

  /**
   * Réactiver un abonnement suspendu
   * PUT /abonnements/:id/reactivate
   */
  @Put(':id/reactivate')
  async reactiverAbonnement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const actorType = user.userType === 'user' ? 'user' : 'societe';
    const abonnement = await this.abonnementService.reactiverAbonnement(id, user.id, actorType);

    return {
      success: true,
      message: 'Abonnement réactivé avec succès',
      data: this.abonnementMapper.toMinimalData(abonnement),
    };
  }

  /**
   * Résilier un abonnement (désactivation définitive)
   * DELETE /abonnements/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async resilierAbonnement(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Seuls les utilisateurs peuvent résilier leurs abonnements');
    }

    await this.abonnementService.resilierAbonnement(id, user.id);

    return {
      success: true,
      message: 'Abonnement résilié avec succès',
    };
  }

  /**
   * Statistiques de mes abonnements (utilisateur)
   * GET /abonnements/stats/my-subscriptions
   */
  @Get('stats/my-subscriptions')
  async getUserStats(@CurrentUser() user?: any) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Endpoint réservé aux utilisateurs');
    }

    const stats = await this.abonnementService.getUserStats(user.id);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Statistiques de mes abonnés (société)
   * GET /abonnements/stats/my-subscribers
   */
  @Get('stats/my-subscribers')
  async getSocieteStats(@CurrentUser() user?: any) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Endpoint réservé aux sociétés');
    }

    const stats = await this.abonnementService.getSocieteStats(user.id);

    return {
      success: true,
      data: stats,
    };
  }

}
