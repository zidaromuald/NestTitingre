// modules/partenariats/services/information-partenaire.service.ts
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformationPartenaire, PartenaireType } from '../entities/information-partenaire.entity';
import { PagePartenariat } from '../entities/page-partenariat.entity';
import { InformationPartenaireRepository } from '../repositories/information-partenaire.repository';
import { CreateInformationPartenaireDto } from '../dto/create-information-partenaire.dto';
import { UpdateInformationPartenaireDto } from '../dto/update-information-partenaire.dto';

@Injectable()
export class InformationPartenaireService {
  constructor(
    @InjectRepository(InformationPartenaire)
    private readonly infoRepo: Repository<InformationPartenaire>,
    private readonly informationPartenaireRepository: InformationPartenaireRepository,
    @InjectRepository(PagePartenariat)
    private readonly pageRepo: Repository<PagePartenariat>,
  ) {}

  /**
   * Créer une InformationPartenaire
   */
  async createInformation(
    actorId: number,
    actorType: 'User' | 'Societe',
    dto: CreateInformationPartenaireDto,
  ): Promise<InformationPartenaire> {
    // Vérifier que la PagePartenariat existe
    const page = await this.pageRepo.findOne({
      where: { id: dto.page_partenariat_id },
      relations: ['abonnement'],
    });

    if (!page) {
      throw new NotFoundException('PagePartenariat introuvable');
    }

    // Vérifier que l'acteur fait partie du partenariat
    if (!page.canBeAccessedBy(actorId, actorType)) {
      throw new ForbiddenException('Vous ne faites pas partie de ce partenariat');
    }

    // Vérifier qu'une information n'existe pas déjà pour ce partenaire
    const exists = await this.informationPartenaireRepository.informationExists(
      dto.page_partenariat_id,
      dto.partenaire_id,
      dto.partenaire_type,
    );

    if (exists) {
      throw new ConflictException('Une information existe déjà pour ce partenaire sur cette page');
    }

    // Créer l'information
    const info = this.infoRepo.create({
      ...dto,
      date_creation: dto.date_creation ? new Date(dto.date_creation) : undefined,
      creee_par: PartenaireType[actorType.toUpperCase() as keyof typeof PartenaireType],
    });

    return this.infoRepo.save(info);
  }

  /**
   * Récupérer toutes les informations d'une PagePartenariat
   */
  async getInformationsForPage(
    pagePartenaritId: number,
    actorId: number,
    actorType: 'User' | 'Societe',
  ): Promise<InformationPartenaire[]> {
    // Vérifier que la page existe et que l'acteur y a accès
    const page = await this.pageRepo.findOne({
      where: { id: pagePartenaritId },
      relations: ['abonnement'],
    });

    if (!page) {
      throw new NotFoundException('PagePartenariat introuvable');
    }

    if (!page.canBeAccessedBy(actorId, actorType)) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette page');
    }

    return this.informationPartenaireRepository.findByPagePartenariatId(pagePartenaritId);
  }

  /**
   * Récupérer une information par ID (avec vérification de permissions)
   */
  async getInformationById(
    id: number,
    actorId: number,
    actorType: 'User' | 'Societe',
  ): Promise<InformationPartenaire> {
    const info = await this.informationPartenaireRepository.findByIdWithRelations(id);

    if (!info) {
      throw new NotFoundException('Information introuvable');
    }

    // Vérifier les permissions
    if (!info.canBeViewedBy(actorId, actorType)) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette information');
    }

    return info;
  }

  /**
   * Modifier une information
   */
  async updateInformation(
    id: number,
    actorId: number,
    actorType: 'User' | 'Societe',
    dto: UpdateInformationPartenaireDto,
  ): Promise<InformationPartenaire> {
    const info = await this.informationPartenaireRepository.findByIdWithRelations(id);

    if (!info) {
      throw new NotFoundException('Information introuvable');
    }

    // Vérifier les permissions (utiliser canBeModifiedByOwner pour que chacun modifie ses propres infos)
    if (!info.canBeModifiedByOwner(actorId, actorType)) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres informations');
    }

    // Appliquer les modifications
    Object.assign(info, {
      ...dto,
      date_creation: dto.date_creation ? new Date(dto.date_creation) : info.date_creation,
    });

    return this.infoRepo.save(info);
  }

  /**
   * Supprimer une information (uniquement le créateur)
   */
  async deleteInformation(id: number, actorId: number, actorType: 'User' | 'Societe'): Promise<void> {
    const info = await this.informationPartenaireRepository.findByIdWithRelations(id);

    if (!info) {
      throw new NotFoundException('Information introuvable');
    }

    // Vérifier les permissions
    if (!info.canBeDeletedBy(actorId, actorType)) {
      throw new ForbiddenException('Seul le créateur peut supprimer cette information');
    }

    await this.infoRepo.remove(info);
  }

  /**
   * Récupérer l'information d'un User sur une page
   */
  async getUserInfoOnPage(pagePartenaritId: number, userId: number): Promise<InformationPartenaire | null> {
    return this.informationPartenaireRepository.findUserInfoOnPage(pagePartenaritId, userId);
  }

  /**
   * Récupérer l'information d'une Societe sur une page
   */
  async getSocieteInfoOnPage(pagePartenaritId: number, societeId: number): Promise<InformationPartenaire | null> {
    return this.informationPartenaireRepository.findSocieteInfoOnPage(pagePartenaritId, societeId);
  }
}
