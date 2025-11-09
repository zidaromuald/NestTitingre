// modules/partenariats/repositories/page-partenariat.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PagePartenariat } from '../entities/page-partenariat.entity';

@Injectable()
export class PagePartenaritRepository extends Repository<PagePartenariat> {
  constructor(private dataSource: DataSource) {
    super(PagePartenariat, dataSource.createEntityManager());
  }

  /**
   * Trouver une PagePartenariat par abonnement_id
   */
  async findByAbonnementId(abonnementId: number): Promise<PagePartenariat | null> {
    return this.findOne({
      where: { abonnement_id: abonnementId },
      relations: ['abonnement', 'transactions', 'informations'],
    });
  }

  /**
   * Vérifier si une PagePartenariat existe pour un abonnement
   */
  async existsByAbonnementId(abonnementId: number): Promise<boolean> {
    const count = await this.count({ where: { abonnement_id: abonnementId } });
    return count > 0;
  }

  /**
   * Récupérer les pages actives d'un User
   */
  async findUserPages(userId: number): Promise<PagePartenariat[]> {
    return this.createQueryBuilder('page')
      .innerJoinAndSelect('page.abonnement', 'abonnement')
      .where('abonnement.user_id = :userId', { userId })
      .andWhere('page.is_active = :isActive', { isActive: true })
      .orderBy('page.created_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer les pages actives d'une Societe
   */
  async findSocietePages(societeId: number): Promise<PagePartenariat[]> {
    return this.createQueryBuilder('page')
      .innerJoinAndSelect('page.abonnement', 'abonnement')
      .where('abonnement.societe_id = :societeId', { societeId })
      .andWhere('page.is_active = :isActive', { isActive: true })
      .orderBy('page.created_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer une page avec toutes ses relations
   */
  async findByIdWithRelations(id: number): Promise<PagePartenariat | null> {
    return this.findOne({
      where: { id },
      relations: ['abonnement', 'transactions', 'informations'],
    });
  }
}
