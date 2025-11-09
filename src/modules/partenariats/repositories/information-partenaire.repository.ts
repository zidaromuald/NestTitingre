// modules/partenariats/repositories/information-partenaire.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InformationPartenaire, PartenaireType } from '../entities/information-partenaire.entity';

@Injectable()
export class InformationPartenaireRepository extends Repository<InformationPartenaire> {
  constructor(private dataSource: DataSource) {
    super(InformationPartenaire, dataSource.createEntityManager());
  }

  /**
   * Récupérer toutes les informations d'une PagePartenariat
   */
  async findByPagePartenariatId(pagePartenaritId: number): Promise<InformationPartenaire[]> {
    return this.find({
      where: { page_partenariat_id: pagePartenaritId, visible_sur_page: true },
      relations: ['pagePartenariat'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Récupérer l'information d'un User sur une PagePartenariat
   */
  async findUserInfoOnPage(
    pagePartenaritId: number,
    userId: number,
  ): Promise<InformationPartenaire | null> {
    return this.findOne({
      where: {
        page_partenariat_id: pagePartenaritId,
        partenaire_id: userId,
        partenaire_type: PartenaireType.USER,
      },
      relations: ['pagePartenariat'],
    });
  }

  /**
   * Récupérer l'information d'une Societe sur une PagePartenariat
   */
  async findSocieteInfoOnPage(
    pagePartenaritId: number,
    societeId: number,
  ): Promise<InformationPartenaire | null> {
    return this.findOne({
      where: {
        page_partenariat_id: pagePartenaritId,
        partenaire_id: societeId,
        partenaire_type: PartenaireType.SOCIETE,
      },
      relations: ['pagePartenariat'],
    });
  }

  /**
   * Vérifier si une information existe déjà
   */
  async informationExists(
    pagePartenaritId: number,
    partenaireId: number,
    partenaireType: PartenaireType,
  ): Promise<boolean> {
    const count = await this.count({
      where: {
        page_partenariat_id: pagePartenaritId,
        partenaire_id: partenaireId,
        partenaire_type: partenaireType,
      },
    });
    return count > 0;
  }

  /**
   * Récupérer une information avec ses relations
   */
  async findByIdWithRelations(id: number): Promise<InformationPartenaire | null> {
    return this.findOne({
      where: { id },
      relations: ['pagePartenariat', 'pagePartenariat.abonnement'],
    });
  }

  /**
   * Récupérer les informations visibles d'une PagePartenariat
   */
  async findVisibleByPageId(pagePartenaritId: number): Promise<InformationPartenaire[]> {
    return this.find({
      where: { page_partenariat_id: pagePartenaritId, visible_sur_page: true },
      order: { created_at: 'ASC' },
    });
  }
}
