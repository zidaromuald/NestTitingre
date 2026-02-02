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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupeDto: CreateGroupeDto, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise pour créer un groupe');
    }
    // Convertir userType ('user' ou 'societe') en type ('User' ou 'Societe')
    const creator = {
      id: req.user.id,
      type: req.user.userType === 'user' ? 'User' : 'Societe',
    };
    return this.groupeService.create(createGroupeDto, creator);
  }

  /**
   * Récupérer les groupes de l'utilisateur connecté
   * GET /groupes/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyGroupes(@Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    // Normaliser userType pour la comparaison avec created_by_type
    const userType = req.user.userType === 'user' ? 'User' : 'Societe';
    return this.groupeService.getUserGroupes(req.user.id, userType);
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
  @UseGuards(JwtAuthGuard)
  async isMember(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    return {
      success: true,
      isMember: await this.groupeService['groupeRepository'].isUserMembre(id, req.user.id),
    };
  }

  /**
   * Récupérer le rôle de l'utilisateur dans le groupe
   * GET /groupes/:id/my-role
   */
  @Get(':id/my-role')
  @UseGuards(JwtAuthGuard)
  async getMyRole(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    const role = await this.groupeService['groupeRepository'].getMembreRole(id, req.user.id);
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
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupeDto: UpdateGroupeDto,
    @Request() req: any,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    return this.groupeService.update(id, updateGroupeDto, req.user.id);
  }

  /**
   * Quitter un groupe
   * POST /groupes/:id/leave
   */
  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async leaveGroupe(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    return this.groupeService.leaveGroupe(id, req.user.id);
  }

  /**
   * Supprimer un groupe (admin uniquement)
   * DELETE /groupes/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroupe(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    return this.groupeService.deleteGroupe(id, req.user.id);
  }
}
