// modules/partenariats/controllers/page-partenariat.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PagePartenaritService } from '../services/page-partenariat.service';
import { PagePartenaritMapper } from '../mappers/page-partenariat.mapper';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('pages-partenariat')
@UseGuards(JwtAuthGuard)
export class PagePartenaritController {
  constructor(
    private readonly pageService: PagePartenaritService,
    private readonly pageMapper: PagePartenaritMapper,
  ) {}

  /**
   * Récupérer une page par userId et societeId
   * GET /pages-partenariat?userId=X&societeId=Y
   * OU récupérer les pages de l'utilisateur connecté
   * GET /pages-partenariat (sans params = mes pages)
   */
  @Get()
  async getPages(
    @Query('userId') userId?: string,
    @Query('societeId') societeId?: string,
    @CurrentUser() user?: any,
  ) {
    // Si userId ET societeId sont fournis → chercher la page spécifique
    if (userId && societeId) {
      const userIdNum = parseInt(userId, 10);
      const societeIdNum = parseInt(societeId, 10);

      if (isNaN(userIdNum) || isNaN(societeIdNum)) {
        throw new UnauthorizedException('userId et societeId doivent être des nombres');
      }

      // Vérifier que l'utilisateur a le droit d'accéder (soit le user, soit la société)
      const actorType = user.userType === 'user' ? 'User' : 'Societe';
      const isAuthorized =
        (actorType === 'User' && user.id === userIdNum) ||
        (actorType === 'Societe' && user.id === societeIdNum);

      if (!isAuthorized) {
        throw new ForbiddenException('Vous n\'avez pas accès à cette page partenariat');
      }

      const page = await this.pageService.getByUserAndSociete(userIdNum, societeIdNum);
      return {
        success: true,
        data: this.pageMapper.toPublicData(page, page.abonnement),
      };
    }

    // Sinon → retourner les pages de l'utilisateur connecté
    if (user.userType === 'user') {
      const pages = await this.pageService.getUserPages(user.id);
      return {
        success: true,
        data: pages.map(p => this.pageMapper.toListData(p)),
        meta: { count: pages.length },
      };
    } else {
      const pages = await this.pageService.getSocietePages(user.id);
      return {
        success: true,
        data: pages.map(p => this.pageMapper.toListData(p)),
        meta: { count: pages.length },
      };
    }
  }

  /**
   * Récupérer une page par ID
   * GET /pages-partenariat/:id
   */
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const page = await this.pageService.getById(id);

    // Vérifier l'accès
    const actorType = user.userType === 'user' ? 'User' : 'Societe';
    if (!await this.pageService.verifyAccess(page, user.id, actorType as 'User' | 'Societe')) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette page');
    }

    return {
      success: true,
      data: this.pageMapper.toPublicData(page, page.abonnement),
    };
  }

  /**
   * Mettre à jour une page
   * PUT /pages-partenariat/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: {
      titre?: string;
      description?: string;
      logo_url?: string;
      couleur_theme?: string;
    },
    @CurrentUser() user?: any,
  ) {
    const actorType = user.userType === 'user' ? 'User' : 'Societe';
    const page = await this.pageService.updatePage(id, user.id, actorType as 'User' | 'Societe', updateData);

    return {
      success: true,
      message: 'Page mise à jour avec succès',
      data: this.pageMapper.toPublicData(page),
    };
  }
}
