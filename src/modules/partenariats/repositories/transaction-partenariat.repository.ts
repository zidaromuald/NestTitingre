// modules/partenariats/repositories/transaction-partenariat.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionPartenariat, TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';

@Injectable()
export class TransactionPartenaritRepository extends Repository<TransactionPartenariat> {
  constructor(private dataSource: DataSource) {
    super(TransactionPartenariat, dataSource.createEntityManager());
  }

  /**
   * Récupérer toutes les transactions d'une PagePartenariat (pour Société)
   */
  async findByPagePartenariatId(pagePartenaritId: number): Promise<TransactionPartenariat[]> {
    return this.find({
      where: { page_partenariat_id: pagePartenaritId },
      relations: ['pagePartenariat', 'pagePartenariat.abonnement'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Récupérer les transactions EN_ATTENTE_VALIDATION pour un User
   */
  async findPendingForUser(userId: number): Promise<TransactionPartenariat[]> {
    return this.createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.pagePartenariat', 'page')
      .innerJoinAndSelect('page.abonnement', 'abonnement')
      .where('abonnement.user_id = :userId', { userId })
      .andWhere('transaction.statut = :statut', {
        statut: TransactionPartenaritStatut.PENDING_VALIDATION,
      })
      .andWhere('transaction.validee_par_user = :validated', { validated: false })
      .orderBy('transaction.created_at', 'DESC')
      .getMany();
  }

  /**
   * Compter les transactions en attente de validation pour un User
   */
  async countPendingForUser(userId: number): Promise<number> {
    return this.createQueryBuilder('transaction')
      .innerJoin('transaction.pagePartenariat', 'page')
      .innerJoin('page.abonnement', 'abonnement')
      .where('abonnement.user_id = :userId', { userId })
      .andWhere('transaction.statut = :statut', {
        statut: TransactionPartenaritStatut.PENDING_VALIDATION,
      })
      .andWhere('transaction.validee_par_user = :validated', { validated: false })
      .getCount();
  }

  /**
   * Récupérer les transactions d'une PagePartenariat par statut
   */
  async findByPageAndStatut(
    pagePartenaritId: number,
    statut: TransactionPartenaritStatut,
  ): Promise<TransactionPartenariat[]> {
    return this.find({
      where: { page_partenariat_id: pagePartenaritId, statut },
      relations: ['pagePartenariat'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Récupérer une transaction avec ses relations
   */
  async findByIdWithRelations(id: number): Promise<TransactionPartenariat | null> {
    return this.findOne({
      where: { id },
      relations: ['pagePartenariat', 'pagePartenariat.abonnement'],
    });
  }

  /**
   * Calculer le total des transactions validées pour une PagePartenariat
   */
  async calculateTotalForPage(pagePartenaritId: number): Promise<{ count: number; total: number }> {
    const result = await this.createQueryBuilder('transaction')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(transaction.prix_total), 0)', 'total')
      .where('transaction.page_partenariat_id = :pagePartenaritId', { pagePartenaritId })
      .andWhere('transaction.validee_par_user = :validated', { validated: true })
      .getRawOne();

    return {
      count: parseInt(result.count, 10),
      total: parseFloat(result.total),
    };
  }
}
