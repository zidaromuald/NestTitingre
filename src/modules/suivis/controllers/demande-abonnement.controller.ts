// modules/suivis/controllers/demande-abonnement.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { DemandeAbonnementService } from '../services/demande-abonnement.service';
import { DemandeAbonnementMapper } from '../mappers/demande-abonnement.mapper';
import { CreateDemandeAbonnementDto } from '../dto/create-demande-abonnement.dto';
import { DemandeAbonnementStatus } from '../entities/demande-abonnement.entity';

@Controller('demandes-abonnement')
export class DemandeAbonnementController {
  constructor(
    private readonly demandeService: DemandeAbonnementService,
    private readonly demandeMapper: DemandeAbonnementMapper,
  ) {}

  /**
   * Envoyer une demande d'abonnement DIRECT (sans suivre d'abord)
   * POST /demandes-abonnement
   */
  @Post()
  async envoyerDemande(@Body() dto: CreateDemandeAbonnementDto) {
    const mockUserId = 1; // TODO: JWT
    const demande = await this.demandeService.envoyerDemande(mockUserId, dto);
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
   */
  @Put(':id/accept')
  async accepterDemande(@Param('id', ParseIntPipe) id: number) {
    const mockSocieteId = 1; // TODO: JWT (extraire societe_id du token)
    const result = await this.demandeService.accepterDemande(id, mockSocieteId);

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
   */
  @Put(':id/decline')
  async refuserDemande(@Param('id', ParseIntPipe) id: number) {
    const mockSocieteId = 1; // TODO: JWT
    const demande = await this.demandeService.refuserDemande(id, mockSocieteId);
    return {
      success: true,
      message: 'Demande d\'abonnement refusée',
      data: this.demandeMapper.toPublicData(demande),
    };
  }

  /**
   * Annuler une demande (par le user qui l'a envoyée)
   * DELETE /demandes-abonnement/:id
   */
  @Delete(':id')
  async annulerDemande(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    await this.demandeService.annulerDemande(id, mockUserId);
    return { success: true, message: 'Demande d\'abonnement annulée' };
  }

  /**
   * Mes demandes envoyées
   * GET /demandes-abonnement/sent?status=pending
   */
  @Get('sent')
  async getMesDemandesEnvoyees(@Query('status') status?: DemandeAbonnementStatus) {
    const mockUserId = 1; // TODO: JWT
    const demandes = await this.demandeService.getMesDemandesEnvoyees(mockUserId, status);
    const data = demandes.map(d => this.demandeMapper.toPublicData(d));
    return { success: true, data, meta: { count: data.length, status: status || 'all' } };
  }

  /**
   * Demandes reçues par une société
   * GET /demandes-abonnement/received?status=pending
   */
  @Get('received')
  async getDemandesRecues(@Query('status') status?: DemandeAbonnementStatus) {
    const mockSocieteId = 1; // TODO: JWT
    const demandes = await this.demandeService.getDemandesRecues(mockSocieteId, status);
    const data = demandes.map(d => this.demandeMapper.toPublicData(d));
    return { success: true, data, meta: { count: data.length, status: status || 'all' } };
  }

  /**
   * Compter les demandes en attente
   * GET /demandes-abonnement/pending/count
   */
  @Get('pending/count')
  async countDemandesPending() {
    const mockSocieteId = 1; // TODO: JWT
    const count = await this.demandeService.countDemandesPending(mockSocieteId);
    return { success: true, data: { count } };
  }
}
