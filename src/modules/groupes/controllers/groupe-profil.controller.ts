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
} from '@nestjs/common';
import { GroupeService } from '../services/groupe.service';

// DTO pour la mise à jour du profil
class UpdateGroupeProfilDto {
  photo_couverture?: string;
  photo_profil?: string;
  description_detaillee?: string;
  regles?: string;
  lien_externe?: string;
  couleur_theme?: string;
}

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
  @HttpCode(HttpStatus.OK)
  async updateProfil(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Body() updateProfilDto: UpdateGroupeProfilDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 1;
    return this.groupeService.updateProfil(groupeId, updateProfilDto, userId);
  }
}
