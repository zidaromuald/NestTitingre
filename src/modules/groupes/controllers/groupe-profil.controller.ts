// modules/groupes/controllers/groupe-profil.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GroupeService } from '../services/groupe.service';
import { UpdateGroupeProfilDto } from '../dto/update-groupe-profil.dto';

@Controller('groupes/:groupeId/profil')
export class GroupeProfilController {
  constructor(private readonly groupeService: GroupeService) {}

  /**
   * Récupérer le profil d'un groupe
   * GET /groupes/:groupeId/profil
   */
  @Get()
  async getProfil(@Param('groupeId', ParseIntPipe) groupeId: number) {
    // Le profil est déjà inclus dans findOne, mais on peut le récupérer séparément
    const groupe = await this.groupeService.findOne(groupeId);
    return {
      success: true,
      data: groupe,
    };
  }

  /**
   * Mettre à jour le profil du groupe (admin uniquement)
   * PUT /groupes/:groupeId/profil
   */
  @Put()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfil(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Body() updateProfilDto: UpdateGroupeProfilDto,
    @Request() req: any,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Authentification requise');
    }
    return this.groupeService.updateProfil(groupeId, updateProfilDto, req.user.id);
  }
}
