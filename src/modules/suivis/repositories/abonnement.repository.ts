// modules/suivis/repositories/abonnement.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Abonnement, AbonnementStatut } from '../entities/abonnement.entity';

@Injectable()
export class AbonnementRepository extends Repository<Abonnement> {
  constructor(private dataSource: DataSource) {
    super(Abonnement, dataSource.createEntityManager());
  }

  /**
   * Trouver un abonnement spécifique
   */
  async findAbonnement(userId: number, societeId: number): Promise<Abonnement | null> {
    return this.findOne({
      where: { user_id: userId, societe_id: societeId },
      relations: ['user', 'societe', 'pagePartenariat', 'groupeCollaboration'],
    });
  }

  /**
   * Trouver les abonnements d'un user
   */
  async findUserAbonnements(userId: number, statut?: AbonnementStatut): Promise<Abonnement[]> {
    const where: any = { user_id: userId };
    if (statut) where.statut = statut;

    return this.find({
      where,
      relations: ['societe', 'pagePartenariat'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Trouver les abonnés d'une société
   */
  async findSocieteAbonnes(societeId: number, statut?: AbonnementStatut): Promise<Abonnement[]> {
    const where: any = { societe_id: societeId };
    if (statut) where.statut = statut;

    return this.find({
      where,
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Compter les abonnements actifs d'un user
   */
  async countUserAbonnementsActifs(userId: number): Promise<number> {
    return this.count({
      where: { user_id: userId, statut: AbonnementStatut.ACTIVE },
    });
  }

  /**
   * Compter les abonnés actifs d'une société
   */
  async countSocieteAbonnesActifs(societeId: number): Promise<number> {
    return this.count({
      where: { societe_id: societeId, statut: AbonnementStatut.ACTIVE },
    });
  }

  /**
   * Vérifier si un abonnement actif existe
   */
  async existeAbonnementActif(userId: number, societeId: number): Promise<boolean> {
    const count = await this.count({
      where: {
        user_id: userId,
        societe_id: societeId,
        statut: AbonnementStatut.ACTIVE,
      },
    });
    return count > 0;
  }

  /**
   * Trouver les abonnements expirant bientôt
   */
  async findAbonnementsExpirantBientot(jours: number = 7): Promise<Abonnement[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + jours);

    return this.createQueryBuilder('abonnement')
      .where('abonnement.statut = :statut', { statut: AbonnementStatut.ACTIVE })
      .andWhere('abonnement.date_fin IS NOT NULL')
      .andWhere('abonnement.date_fin <= :dateLimit', { dateLimit })
      .andWhere('abonnement.date_fin > NOW()')
      .leftJoinAndSelect('abonnement.user', 'user')
      .leftJoinAndSelect('abonnement.societe', 'societe')
      .orderBy('abonnement.date_fin', 'ASC')
      .getMany();
  }
}
