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
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { GroupeService } from '../services/groupe.service';

// DTO pour la mise à jour du profil
class UpdateGroupeProfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_couverture?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_profil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_detaillee?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  regles?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lien_externe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
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
    const userId = req.user?.id;
    return this.groupeService.updateProfil(groupeId, updateProfilDto, userId);
  }
}
