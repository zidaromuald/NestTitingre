// modules/groupes/controllers/groupe-invitation.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GroupeService } from '../services/groupe.service';
import { InviteMembreDto } from '../dto/invite-membre.dto';

@Controller('groupes')
@UseGuards(JwtAuthGuard)
export class GroupeInvitationController {
  constructor(private readonly groupeService: GroupeService) {}

  /**
   * Inviter un utilisateur à rejoindre le groupe
   * POST /groupes/:id/invite
   */
  @Post(':id/invite')
  @HttpCode(HttpStatus.CREATED)
  async inviteMembre(
    @Param('id', ParseIntPipe) groupeId: number,
    @Body() inviteDto: InviteMembreDto,
    @Request() req: any,
  ) {
    const invitedByUserId = req.user.id;
    return this.groupeService.inviteMembre(groupeId, inviteDto, invitedByUserId);
  }

  /**
   * Récupérer les invitations reçues par l'utilisateur connecté
   * GET /groupes/invitations/me
   */
  @Get('invitations/me')
  async getMyInvitations(@Request() req: any) {
    const userId = req.user.id;
    return this.groupeService.getMyInvitations(userId);
  }

  /**
   * Accepter une invitation à rejoindre un groupe
   * POST /groupes/invitations/:id/accept
   */
  @Post('invitations/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('id', ParseIntPipe) invitationId: number,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.groupeService.acceptInvitation(invitationId, userId);
  }

  /**
   * Refuser une invitation à rejoindre un groupe
   * POST /groupes/invitations/:id/decline
   */
  @Post('invitations/:id/decline')
  @HttpCode(HttpStatus.OK)
  async declineInvitation(
    @Param('id', ParseIntPipe) invitationId: number,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.groupeService.declineInvitation(invitationId, userId);
  }
}
