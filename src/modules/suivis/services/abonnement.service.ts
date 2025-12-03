// modules/suivis/services/abonnement.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Abonnement, AbonnementStatut, AbonnementPlan } from '../entities/abonnement.entity';
import { AbonnementRepository } from '../repositories/abonnement.repository';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { PagePartenariat } from '../../partenariats/entities/page-partenariat.entity';
//import { GroupeCollaboration } from '../../collaborations/entities/groupe-collaboration.entity';

@Injectable()
export class AbonnementService {
  constructor(
    @InjectRepository(Abonnement) private readonly abonnementRepo: Repository<Abonnement>,
    private readonly abonnementRepository: AbonnementRepository,
    private dataSource: DataSource,
  ) {}

  /**
   * Récupérer un abonnement spécifique avec toutes ses relations
   */
  async getAbonnement(userId: number, societeId: number): Promise<Abonnement> {
    const abonnement = await this.abonnementRepository.findAbonnement(userId, societeId);
    if (!abonnement) {
      throw new NotFoundException('Abonnement introuvable');
    }
    return abonnement;
  }

  /**
   * Récupérer un abonnement par ID
   */
  async getAbonnementById(abonnementId: number): Promise<Abonnement> {
    const abonnement = await this.abonnementRepo.findOne({
      where: { id: abonnementId },
      relations: ['user', 'societe', 'pagePartenariat', 'groupeCollaboration'],
    });

    if (!abonnement) {
      throw new NotFoundException('Abonnement introuvable');
    }

    return abonnement;
  }

  /**
   * Récupérer tous les abonnements d'un utilisateur
   * GET /abonnements/my-subscriptions?statut=active
   */
  async getMyAbonnements(userId: number, statut?: AbonnementStatut): Promise<Abonnement[]> {
    return this.abonnementRepository.findUserAbonnements(userId, statut);
  }

  /**
   * Récupérer tous les abonnés d'une société
   * GET /abonnements/my-subscribers?statut=active
   */
  async getMyAbonnes(societeId: number, statut?: AbonnementStatut): Promise<Abonnement[]> {
    return this.abonnementRepository.findSocieteAbonnes(societeId, statut);
  }

  /**
   * Vérifier si un utilisateur est abonné à une société
   * GET /abonnements/check/:societeId
   */
  async isAbonne(userId: number, societeId: number): Promise<boolean> {
    return this.abonnementRepository.existeAbonnementActif(userId, societeId);
  }

  /**
   * Mettre à jour un abonnement (plan, secteur, permissions, etc.)
   * Seul l'utilisateur peut modifier son abonnement
   */
  async updateAbonnement(
    abonnementId: number,
    userId: number,
    updateData: {
      plan_collaboration?: AbonnementPlan;
      secteur_collaboration?: string;
      role_utilisateur?: string;
      permissions?: string[];
    },
  ): Promise<Abonnement> {
    const abonnement = await this.getAbonnementById(abonnementId);

    // Vérifier que c'est bien l'utilisateur de cet abonnement
    if (abonnement.user_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cet abonnement');
    }

    // Vérifier que l'abonnement est actif
    if (!abonnement.isActive()) {
      throw new BadRequestException('Impossible de modifier un abonnement inactif');
    }

    // Si upgrade de plan, vérifier que c'est autorisé
    if (updateData.plan_collaboration && updateData.plan_collaboration !== abonnement.plan_collaboration) {
      if (!abonnement.peutUpgraderVers(updateData.plan_collaboration)) {
        throw new BadRequestException(`Impossible d'upgrader vers le plan ${updateData.plan_collaboration}`);
      }
    }

    // Appliquer les mises à jour
    Object.assign(abonnement, updateData);

    return this.abonnementRepo.save(abonnement);
  }

  /**
   * Suspendre un abonnement (par l'utilisateur ou la société)
   */
  async suspendreAbonnement(abonnementId: number, actorId: number, actorType: 'user' | 'societe'): Promise<Abonnement> {
    const abonnement = await this.getAbonnementById(abonnementId);

    // Vérifier les permissions
    if (actorType === 'user' && abonnement.user_id !== actorId) {
      throw new ForbiddenException('Vous ne pouvez pas suspendre cet abonnement');
    }
    if (actorType === 'societe' && abonnement.societe_id !== actorId) {
      throw new ForbiddenException('Vous ne pouvez pas suspendre cet abonnement');
    }

    if (abonnement.statut === AbonnementStatut.SUSPENDED) {
      throw new BadRequestException('Cet abonnement est déjà suspendu');
    }

    if (!abonnement.isActive()) {
      throw new BadRequestException('Impossible de suspendre un abonnement inactif');
    }

    abonnement.statut = AbonnementStatut.SUSPENDED;
    return this.abonnementRepo.save(abonnement);
  }

  /**
   * Réactiver un abonnement suspendu
   */
  async reactiverAbonnement(abonnementId: number, actorId: number, actorType: 'user' | 'societe'): Promise<Abonnement> {
    const abonnement = await this.getAbonnementById(abonnementId);

    // Vérifier les permissions
    if (actorType === 'user' && abonnement.user_id !== actorId) {
      throw new ForbiddenException('Vous ne pouvez pas réactiver cet abonnement');
    }
    if (actorType === 'societe' && abonnement.societe_id !== actorId) {
      throw new ForbiddenException('Vous ne pouvez pas réactiver cet abonnement');
    }

    if (abonnement.statut !== AbonnementStatut.SUSPENDED) {
      throw new BadRequestException('Seul un abonnement suspendu peut être réactivé');
    }

    abonnement.statut = AbonnementStatut.ACTIVE;
    return this.abonnementRepo.save(abonnement);
  }

  /**
   * Résilier un abonnement (désactivation définitive)
   */
  async resilierAbonnement(abonnementId: number, userId: number): Promise<void> {
    const abonnement = await this.getAbonnementById(abonnementId);

    // Seul l'utilisateur peut résilier son abonnement
    if (abonnement.user_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas résilier cet abonnement');
    }

    if (abonnement.statut === AbonnementStatut.INACTIVE) {
      throw new BadRequestException('Cet abonnement est déjà résilié');
    }

    abonnement.statut = AbonnementStatut.INACTIVE;
    abonnement.date_fin = new Date();

    await this.abonnementRepo.save(abonnement);
  }

  /**
   * Gérer les permissions de l'abonnement
   */
  async updatePermissions(abonnementId: number, userId: number, permissions: string[]): Promise<Abonnement> {
    const abonnement = await this.getAbonnementById(abonnementId);

    if (abonnement.user_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier les permissions de cet abonnement');
    }

    if (!abonnement.isActive()) {
      throw new BadRequestException('Impossible de modifier les permissions d\'un abonnement inactif');
    }

    abonnement.permissions = permissions;
    return this.abonnementRepo.save(abonnement);
  }

  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  async hasPermission(abonnementId: number, permission: string): Promise<boolean> {
    const abonnement = await this.getAbonnementById(abonnementId);
    return abonnement.hasPermission(permission);
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  async getUserStats(userId: number): Promise<{
    total: number;
    actifs: number;
    suspendus: number;
    inactifs: number;
    par_plan: { standard: number; premium: number; enterprise: number };
  }> {
    const abonnements = await this.abonnementRepository.findUserAbonnements(userId);

    const stats = {
      total: abonnements.length,
      actifs: abonnements.filter(a => a.statut === AbonnementStatut.ACTIVE).length,
      suspendus: abonnements.filter(a => a.statut === AbonnementStatut.SUSPENDED).length,
      inactifs: abonnements.filter(a => a.statut === AbonnementStatut.INACTIVE).length,
      par_plan: {
        standard: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.STANDARD).length,
        premium: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.PREMIUM).length,
        enterprise: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.ENTERPRISE).length,
      },
    };

    return stats;
  }

  /**
   * Obtenir les statistiques d'une société
   */
  async getSocieteStats(societeId: number): Promise<{
    total: number;
    actifs: number;
    suspendus: number;
    inactifs: number;
    par_plan: { standard: number; premium: number; enterprise: number };
  }> {
    const abonnements = await this.abonnementRepository.findSocieteAbonnes(societeId);

    const stats = {
      total: abonnements.length,
      actifs: abonnements.filter(a => a.statut === AbonnementStatut.ACTIVE).length,
      suspendus: abonnements.filter(a => a.statut === AbonnementStatut.SUSPENDED).length,
      inactifs: abonnements.filter(a => a.statut === AbonnementStatut.INACTIVE).length,
      par_plan: {
        standard: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.STANDARD).length,
        premium: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.PREMIUM).length,
        enterprise: abonnements.filter(a => a.plan_collaboration === AbonnementPlan.ENTERPRISE).length,
      },
    };

    return stats;
  }

  /**
   * Récupérer les abonnements expirant bientôt
   */
  async getAbonnementsExpirantBientot(jours: number = 7): Promise<Abonnement[]> {
    return this.abonnementRepository.findAbonnementsExpirantBientot(jours);
  }

  /**
   * Compter les abonnements actifs d'un utilisateur
   */
  async countUserAbonnementsActifs(userId: number): Promise<number> {
    return this.abonnementRepository.countUserAbonnementsActifs(userId);
  }

  /**
   * Compter les abonnés actifs d'une société
   */
  async countSocieteAbonnesActifs(societeId: number): Promise<number> {
    return this.abonnementRepository.countSocieteAbonnesActifs(societeId);
  }
}
