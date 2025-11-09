// modules/suivis/repositories/demande-abonnement.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DemandeAbonnement, DemandeAbonnementStatus } from '../entities/demande-abonnement.entity';

@Injectable()
export class DemandeAbonnementRepository extends Repository<DemandeAbonnement> {
  constructor(private dataSource: DataSource) {
    super(DemandeAbonnement, dataSource.createEntityManager());
  }

  /**
   * Trouver une demande spécifique
   */
  async findDemande(userId: number, societeId: number): Promise<DemandeAbonnement | null> {
    return this.findOne({
      where: { user_id: userId, societe_id: societeId }
    });
  }

  /**
   * Trouver les demandes envoyées par un user
   */
  async findDemandesEnvoyees(userId: number, status?: DemandeAbonnementStatus): Promise<DemandeAbonnement[]> {
    const where: any = { user_id: userId };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  }

  /**
   * Trouver les demandes reçues par une société
   */
  async findDemandesRecues(societeId: number, status?: DemandeAbonnementStatus): Promise<DemandeAbonnement[]> {
    const where: any = { societe_id: societeId };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  }

  /**
   * Compter les demandes en attente pour une société
   */
  async countDemandesPending(societeId: number): Promise<number> {
    return this.count({
      where: { societe_id: societeId, status: DemandeAbonnementStatus.PENDING }
    });
  }

  /**
   * Vérifier si une demande pending existe déjà
   */
  async hasDemandePending(userId: number, societeId: number): Promise<boolean> {
    return (await this.count({
      where: {
        user_id: userId,
        societe_id: societeId,
        status: DemandeAbonnementStatus.PENDING
      }
    })) > 0;
  }
}
