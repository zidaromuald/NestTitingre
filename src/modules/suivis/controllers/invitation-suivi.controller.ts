// modules/suivis/controllers/invitation-suivi.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InvitationSuiviService } from '../services/invitation-suivi.service';
import { InvitationSuiviMapper } from '../mappers/invitation-suivi.mapper';
import { SuivrePolymorphicService } from '../services/suivre-polymorphic.service';
import { CreateInvitationSuiviDto } from '../dto/create-invitation-suivi.dto';
import { InvitationSuiviStatus } from '../entities/invitation-suivi.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('invitations-suivi')
@UseGuards(JwtAuthGuard) // Protège tous les endpoints du contrôleur
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
  async envoyerInvitation(
    @Body() dto: CreateInvitationSuiviDto,
    @CurrentUser() user: any,
  ) {
    // Debug: logger les données reçues
    console.log('=== DEBUG envoyerInvitation ===');
    console.log('User:', { id: user.id, userType: user.userType });
    console.log('DTO:', dto);

    // Normaliser le userType: 'user' -> 'User', 'societe' -> 'Societe'
    const senderType = user.userType === 'user' ? 'User' : 'Societe';
    console.log('SenderType normalisé:', senderType);

    const invitation = await this.invitationService.envoyerInvitation(user.id, senderType, dto);
    return {
      success: true,
      message: `Invitation envoyée à ${dto.receiver_type === 'User' ? 'l\'utilisateur' : 'la société'}`,
      data: this.invitationMapper.toPublicData(invitation),
    };
  }

  /**
   * Accepter une invitation
   * PUT /invitations-suivi/:id/accept
   */
  @Put(':id/accept')
  async accepterInvitation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const { invitation, suivres } = await this.invitationService.accepterInvitation(id, user.id, user.userType);
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
  async refuserInvitation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const invitation = await this.invitationService.refuserInvitation(id, user.id, user.userType);
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
  async annulerInvitation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    await this.invitationService.annulerInvitation(id, user.id);
    return { success: true, message: 'Invitation annulée' };
  }

  /**
   * Mes invitations envoyées
   * GET /invitations-suivi/sent?status=pending
   */
  @Get('sent')
  async getMesInvitationsEnvoyees(
    @Query('status') status?: InvitationSuiviStatus,
    @CurrentUser() user?: any,
  ) {
    const senderType = user.userType === 'user' ? 'User' : 'Societe';
    const invitations = await this.invitationService.getMesInvitationsEnvoyees(user.id, senderType, status);
    const data = invitations.map(inv => this.invitationMapper.toPublicData(inv));
    return { success: true, data, meta: { count: data.length, status: status || 'all' }};
  }

  /**
   * Mes invitations reçues
   * GET /invitations-suivi/received?status=pending
   */
  @Get('received')
  async getMesInvitationsRecues(
    @Query('status') status?: InvitationSuiviStatus,
    @CurrentUser() user?: any,
  ) {
    const receiverType = user.userType === 'user' ? 'User' : 'Societe';
    const invitations = await this.invitationService.getMesInvitationsRecues(user.id, receiverType, status);
    const data = invitations.map(inv => this.invitationMapper.toPublicData(inv));
    return { success: true, data, meta: { count: data.length, status: status || 'all' }};
  }

  /**
   * Compter mes invitations en attente
   * GET /invitations-suivi/pending/count
   */
  @Get('pending/count')
  async countInvitationsPending(@CurrentUser() user?: any) {
    const receiverType = user.userType === 'user' ? 'User' : 'Societe';
    const count = await this.invitationService.countInvitationsPending(user.id, receiverType);
    return { success: true, data: { count }};
  }
}
