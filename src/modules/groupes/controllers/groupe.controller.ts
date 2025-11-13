// modules/groupes/controllers/groupe.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GroupeService } from '../services/groupe.service';
import { CreateGroupeDto } from '../dto/create-groupe.dto';
import { UpdateGroupeDto } from '../dto/update-groupe.dto';

@Controller('groupes')
export class GroupeController {
  constructor(private readonly groupeService: GroupeService) {}

  /**
   * Créer un nouveau groupe
   * POST /groupes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupeDto: CreateGroupeDto, @Request() req: any) {
    const creator = req.user || { id: 1, type: 'User' };
    return this.groupeService.create(createGroupeDto, creator);
  }

  /**
   * Récupérer les groupes de l'utilisateur connecté
   * GET /groupes/me
   */
  @Get('me')
  async getMyGroupes(@Request() req: any) {
    const userId = req.user?.id || 1;
    return this.groupeService.getUserGroupes(userId);
  }

  /**
   * Rechercher des groupes
   * GET /groupes/search/query?q=mot
   */
  @Get('search/query')
  async search(@Query('q') query: string) {
    return this.groupeService.search(query, 20);
  }

  /**
   * Récupérer un groupe par ID
   * GET /groupes/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id;
    return this.groupeService.findOne(id, userId);
  }

  /**
   * Vérifier si l'utilisateur est membre du groupe
   * GET /groupes/:id/is-member
   */
  @Get(':id/is-member')
  async isMember(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    // TODO: Implémenter dans le service si nécessaire
    return {
      success: true,
      isMember: await this.groupeService['groupeRepository'].isUserMembre(id, userId),
    };
  }

  /**
   * Récupérer le rôle de l'utilisateur dans le groupe
   * GET /groupes/:id/my-role
   */
  @Get(':id/my-role')
  async getMyRole(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    const role = await this.groupeService['groupeRepository'].getMembreRole(id, userId);
    return {
      success: true,
      role,
    };
  }

  /**
   * Mettre à jour un groupe
   * PUT /groupes/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupeDto: UpdateGroupeDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 1;
    return this.groupeService.update(id, updateGroupeDto, userId);
  }

  /**
   * Quitter un groupe
   * POST /groupes/:id/leave
   */
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveGroupe(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.groupeService.leaveGroupe(id, userId);
  }

  /**
   * Supprimer un groupe (admin uniquement)
   * DELETE /groupes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroupe(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.groupeService.deleteGroupe(id, userId);
  }
}
