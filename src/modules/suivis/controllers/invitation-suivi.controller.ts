// modules/suivis/controllers/invitation-suivi.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { InvitationSuiviService } from '../services/invitation-suivi.service';
import { InvitationSuiviMapper } from '../mappers/invitation-suivi.mapper';
import { SuivrePolymorphicService } from '../services/suivre-polymorphic.service';
import { CreateInvitationSuiviDto } from '../dto/create-invitation-suivi.dto';
import { InvitationSuiviStatus } from '../entities/invitation-suivi.entity';

@Controller('invitations-suivi')
export class InvitationSuiviController {
  constructor(
    private readonly invitationService: InvitationSuiviService,
    private readonly invitationMapper: InvitationSuiviMapper,
    private readonly suivrePolymorphicService: SuivrePolymorphicService,
  ) {}

  /**
   * Envoyer une invitation (clic "Suivre")
   * POST /invitations-suivi
   */
  @Post()
  async envoyerInvitation(@Body() dto: CreateInvitationSuiviDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT (extraire depuis le token si c'est User ou Societe)
    const invitation = await this.invitationService.envoyerInvitation(mockUserId, mockUserType, dto);
    return {
      success: true,
      message: `Invitation envoyée à ${dto.target_type === 'User' ? 'l\'utilisateur' : 'la société'}`,
      data: this.invitationMapper.toPublicData(invitation),
    };
  }

  /**
   * Accepter une invitation
   * PUT /invitations-suivi/:id/accept
   */
  @Put(':id/accept')
  async accepterInvitation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const { invitation, suivres } = await this.invitationService.accepterInvitation(id, mockUserId);
    return {
      success: true,
      message: 'Invitation acceptée. Vous êtes maintenant connectés !',
      data: {
        invitation: this.invitationMapper.toPublicData(invitation),
        connexions_creees: suivres.length,
      },
    };
  }

  /**
   * Refuser une invitation
   * PUT /invitations-suivi/:id/decline
   */
  @Put(':id/decline')
  async refuserInvitation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const invitation = await this.invitationService.refuserInvitation(id, mockUserId);
    return {
      success: true,
      message: 'Invitation refusée',
      data: this.invitationMapper.toPublicData(invitation),
    };
  }

  /**
   * Annuler une invitation (sender uniquement)
   * DELETE /invitations-suivi/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async annulerInvitation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    await this.invitationService.annulerInvitation(id, mockUserId);
    return { success: true, message: 'Invitation annulée' };
  }

  /**
   * Mes invitations envoyées
   * GET /invitations-suivi/sent?status=pending
   */
  @Get('sent')
  async getMesInvitationsEnvoyees(@Query('status') status?: InvitationSuiviStatus) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const invitations = await this.invitationService.getMesInvitationsEnvoyees(mockUserId, mockUserType, status);
    const data = invitations.map(inv => this.invitationMapper.toPublicData(inv));
    return { success: true, data, meta: { count: data.length, status: status || 'all' }};
  }

  /**
   * Mes invitations reçues
   * GET /invitations-suivi/received?status=pending
   */
  @Get('received')
  async getMesInvitationsRecues(@Query('status') status?: InvitationSuiviStatus) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT (peut être 'Societe' si c'est une société)
    const invitations = await this.invitationService.getMesInvitationsRecues(mockUserId, mockUserType, status);
    const data = invitations.map(inv => this.invitationMapper.toPublicData(inv));
    return { success: true, data, meta: { count: data.length, status: status || 'all' }};
  }

  /**
   * Compter mes invitations en attente
   * GET /invitations-suivi/pending/count
   */
  @Get('pending/count')
  async countInvitationsPending() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT
    const count = await this.invitationService.countInvitationsPending(mockUserId, mockUserType);
    return { success: true, data: { count }};
  }
}
