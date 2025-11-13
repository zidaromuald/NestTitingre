// modules/groupes/controllers/groupe-membre.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GroupeService } from '../services/groupe.service';
import { UpdateMembreRoleDto } from '../dto/update-membre-role.dto';

@Controller('groupes/:groupeId/membres')
export class GroupeMembreController {
  constructor(private readonly groupeService: GroupeService) {}

  /**
   * Récupérer la liste des membres d'un groupe
   * GET /groupes/:groupeId/membres
   */
  @Get()
  async getMembres(@Param('groupeId', ParseIntPipe) groupeId: number) {
    return this.groupeService.getMembres(groupeId);
  }

  /**
   * Rejoindre un groupe public (sans invitation)
   * POST /groupes/:groupeId/membres/join
   */
  @Post('join')
  @HttpCode(HttpStatus.CREATED)
  async joinGroupe(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 1;
    return this.groupeService.joinGroupe(groupeId, userId);
  }

  /**
   * Mettre à jour le rôle d'un membre (admin uniquement)
   * PUT /groupes/:groupeId/membres/:userId/role
   */
  @Put(':userId/role')
  async updateMembreRole(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateRoleDto: UpdateMembreRoleDto,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.id || 1;
    return this.groupeService.updateMembreRole(
      groupeId,
      userId,
      updateRoleDto,
      adminUserId,
    );
  }

  /**
   * Expulser un membre du groupe (admin uniquement)
   * DELETE /groupes/:groupeId/membres/:userId
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMembre(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.id || 1;
    return this.groupeService.removeMembre(groupeId, userId, adminUserId);
  }

  /**
   * Suspendre un membre (admin uniquement)
   * POST /groupes/:groupeId/membres/:userId/suspend
   */
  @Post(':userId/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendMembre(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.id || 1;
    return this.groupeService.suspendMembre(groupeId, userId, adminUserId);
  }

  /**
   * Bannir un membre définitivement (admin uniquement)
   * POST /groupes/:groupeId/membres/:userId/ban
   */
  @Post(':userId/ban')
  @HttpCode(HttpStatus.OK)
  async banMembre(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    const adminUserId = req.user?.id || 1;
    return this.groupeService.banMembre(groupeId, userId, adminUserId);
  }
}
