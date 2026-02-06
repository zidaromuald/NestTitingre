// modules/partenariats/services/page-partenariat.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagePartenariat } from '../entities/page-partenariat.entity';
import { PagePartenaritRepository } from '../repositories/page-partenariat.repository';
import { Abonnement } from '../../suivis/entities/abonnement.entity';

@Injectable()
export class PagePartenaritService {
  constructor(
    private readonly pageRepository: PagePartenaritRepository,
    @InjectRepository(Abonnement)
    private readonly abonnementRepo: Repository<Abonnement>,
  ) {}

  /**
   * Récupérer une page par ID
   */
  async getById(pageId: number): Promise<PagePartenariat> {
    const page = await this.pageRepository.findByIdWithRelations(pageId);
    if (!page) {
      throw new NotFoundException('Page partenariat introuvable');
    }
    return page;
  }

  /**
   * Récupérer une page par userId et societeId (via l'abonnement)
   * C'est la méthode clé pour le frontend qui passe ?userId=X&societeId=Y
   */
  async getByUserAndSociete(userId: number, societeId: number): Promise<PagePartenariat> {
    // 1. Trouver l'abonnement entre ce user et cette société
    const abonnement = await this.abonnementRepo.findOne({
      where: { user_id: userId, societe_id: societeId },
    });

    if (!abonnement) {
      throw new NotFoundException('Aucun abonnement trouvé entre cet utilisateur et cette société');
    }

    // 2. Trouver la page liée à cet abonnement
    const page = await this.pageRepository.findByAbonnementId(abonnement.id);
    if (!page) {
      throw new NotFoundException('Page partenariat introuvable pour cet abonnement');
    }

    return page;
  }

  /**
   * Récupérer les pages d'un utilisateur
   */
  async getUserPages(userId: number): Promise<PagePartenariat[]> {
    return this.pageRepository.findUserPages(userId);
  }

  /**
   * Récupérer les pages d'une société
   */
  async getSocietePages(societeId: number): Promise<PagePartenariat[]> {
    return this.pageRepository.findSocietePages(societeId);
  }

  /**
   * Vérifier si l'acteur peut accéder à cette page
   */
  async verifyAccess(page: PagePartenariat, actorId: number, actorType: 'User' | 'Societe'): Promise<boolean> {
    // Charger l'abonnement si pas déjà chargé
    if (!page.abonnement) {
      const fullPage = await this.pageRepository.findByIdWithRelations(page.id);
      if (!fullPage || !fullPage.abonnement) return false;
      page = fullPage;
    }

    return page.canBeAccessedBy(actorId, actorType);
  }

  /**
   * Mettre à jour une page partenariat
   */
  async updatePage(
    pageId: number,
    actorId: number,
    actorType: 'User' | 'Societe',
    updateData: {
      titre?: string;
      description?: string;
      logo_url?: string;
      couleur_theme?: string;
    },
  ): Promise<PagePartenariat> {
    const page = await this.getById(pageId);

    // Vérifier les permissions
    if (!await this.verifyAccess(page, actorId, actorType)) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette page');
    }

    // Appliquer les mises à jour
    if (updateData.titre) page.titre = updateData.titre;
    if (updateData.description !== undefined) page.description = updateData.description;
    if (updateData.logo_url !== undefined) page.logo_url = updateData.logo_url;
    if (updateData.couleur_theme !== undefined) page.couleur_theme = updateData.couleur_theme;

    return this.pageRepository.save(page);
  }
}
