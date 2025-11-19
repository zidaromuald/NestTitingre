// modules/suivis/controllers/demande-abonnement.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { DemandeAbonnementService } from '../services/demande-abonnement.service';
import { DemandeAbonnementMapper } from '../mappers/demande-abonnement.mapper';
import { CreateDemandeAbonnementDto } from '../dto/create-demande-abonnement.dto';
import { DemandeAbonnementStatus } from '../entities/demande-abonnement.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('demandes-abonnement')
@UseGuards(JwtAuthGuard) // Protège tous les endpoints du contrôleur
export class DemandeAbonnementController {
  constructor(
    private readonly demandeService: DemandeAbonnementService,
    private readonly demandeMapper: DemandeAbonnementMapper,
  ) {}

  /**
   * Envoyer une demande d'abonnement DIRECT (sans suivre d'abord)
   * POST /demandes-abonnement
   * Accessible uniquement aux utilisateurs (pas aux sociétés)
   */
  @Post()
  async envoyerDemande(
    @Body() dto: CreateDemandeAbonnementDto,
    @CurrentUser() user: any,
  ) {
    // Vérifier que c'est bien un utilisateur et pas une société
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Seuls les utilisateurs peuvent envoyer des demandes d\'abonnement');
    }

    const demande = await this.demandeService.envoyerDemande(user.id, dto);
    return {
      success: true,
      message: 'Demande d\'abonnement envoyée à la société',
      data: this.demandeMapper.toPublicData(demande),
    };
  }

  /**
   * Accepter une demande d'abonnement
   * PUT /demandes-abonnement/:id/accept
   * Crée: Suivre + Abonnement + PagePartenariat en une seule transaction
   * Accessible uniquement aux sociétés
   */
  @Put(':id/accept')
  async accepterDemande(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Seules les sociétés peuvent accepter des demandes d\'abonnement');
    }

    const result = await this.demandeService.accepterDemande(id, user.id);

    return {
      success: true,
      message: 'Demande d\'abonnement acceptée. L\'utilisateur est maintenant suivi et abonné.',
      data: {
        demande: this.demandeMapper.toPublicData(result.demande),
        suivres_created: result.suivres.length,
        abonnement_id: result.abonnement.id,
        page_partenariat_id: result.pagePartenariat.id,
      },
    };
  }

  /**
   * Refuser une demande d'abonnement
   * PUT /demandes-abonnement/:id/decline
   * Accessible uniquement aux sociétés
   */
  @Put(':id/decline')
  async refuserDemande(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Seules les sociétés peuvent refuser des demandes d\'abonnement');
    }

    const demande = await this.demandeService.refuserDemande(id, user.id);
    return {
      success: true,
      message: 'Demande d\'abonnement refusée',
      data: this.demandeMapper.toPublicData(demande),
    };
  }

  /**
   * Annuler une demande (par le user qui l'a envoyée)
   * DELETE /demandes-abonnement/:id
   * Accessible uniquement aux utilisateurs
   */
  @Delete(':id')
  async annulerDemande(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Seuls les utilisateurs peuvent annuler leurs demandes');
    }

    await this.demandeService.annulerDemande(id, user.id);
    return { success: true, message: 'Demande d\'abonnement annulée' };
  }

  /**
   * Mes demandes envoyées
   * GET /demandes-abonnement/sent?status=pending
   * Accessible uniquement aux utilisateurs
   */
  @Get('sent')
  async getMesDemandesEnvoyees(
    @Query('status') status?: DemandeAbonnementStatus,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien un utilisateur
    if (user.userType !== 'user') {
      throw new UnauthorizedException('Endpoint réservé aux utilisateurs');
    }

    const demandes = await this.demandeService.getMesDemandesEnvoyees(user.id, status);
    const data = demandes.map(d => this.demandeMapper.toPublicData(d));
    return { success: true, data, meta: { count: data.length, status: status || 'all' } };
  }

  /**
   * Demandes reçues par une société
   * GET /demandes-abonnement/received?status=pending
   * Accessible uniquement aux sociétés
   */
  @Get('received')
  async getDemandesRecues(
    @Query('status') status?: DemandeAbonnementStatus,
    @CurrentUser() user?: any,
  ) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Endpoint réservé aux sociétés');
    }

    const demandes = await this.demandeService.getDemandesRecues(user.id, status);
    const data = demandes.map(d => this.demandeMapper.toPublicData(d));
    return { success: true, data, meta: { count: data.length, status: status || 'all' } };
  }

  /**
   * Compter les demandes en attente
   * GET /demandes-abonnement/pending/count
   * Accessible uniquement aux sociétés
   */
  @Get('pending/count')
  async countDemandesPending(@CurrentUser() user?: any) {
    // Vérifier que c'est bien une société
    if (user.userType !== 'societe') {
      throw new UnauthorizedException('Endpoint réservé aux sociétés');
    }

    const count = await this.demandeService.countDemandesPending(user.id);
    return { success: true, data: { count } };
  }
}
