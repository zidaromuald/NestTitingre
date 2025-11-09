// modules/groupes/controllers/groupe.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
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
import { InviteMembreDto } from '../dto/invite-membre.dto';
import { UpdateMembreRoleDto } from '../dto/update-membre-role.dto';

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
   * Récupérer un groupe par ID
   * GET /groupes/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id;
    return this.groupeService.findOne(id, userId);
  }

  /**
   * Rechercher des groupes
   * GET /groupes/search?q=mot
   */
  @Get('search/query')
  async search(@Query('q') query: string) {
    return this.groupeService.search(query, 20);
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
}
