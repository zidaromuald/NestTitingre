// modules/suivis/services/demande-abonnement.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DemandeAbonnement, DemandeAbonnementStatus } from '../entities/demande-abonnement.entity';
import { Suivre } from '../entities/suivre.entity';
import { Abonnement, AbonnementStatut, AbonnementPlan } from '../entities/abonnement.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { PagePartenariat, VisibilitePagePartenariat } from '../../partenariats/entities/page-partenariat.entity';
import { DemandeAbonnementRepository } from '../repositories/demande-abonnement.repository';
import { CreateDemandeAbonnementDto } from '../dto/create-demande-abonnement.dto';

@Injectable()
export class DemandeAbonnementService {
  constructor(
    @InjectRepository(DemandeAbonnement) private readonly demandeRepo: Repository<DemandeAbonnement>,
    private readonly demandeAbonnementRepository: DemandeAbonnementRepository,
    @InjectRepository(Abonnement) private readonly abonnementRepo: Repository<Abonnement>,
    private dataSource: DataSource,
  ) {}

  /**
   * Envoyer une demande d'abonnement DIRECT (sans suivre d'abord)
   */
  async envoyerDemande(userId: number, dto: CreateDemandeAbonnementDto): Promise<DemandeAbonnement> {
    // Vérifier que le user existe - utiliser DataSource au lieu de Repository
    const user = await this.dataSource.getRepository(User).findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Vérifier que la société existe - utiliser DataSource au lieu de Repository
    const societe = await this.dataSource.getRepository(Societe).findOne({ where: { id: dto.societe_id } });
    if (!societe) throw new NotFoundException('Société introuvable');

    // Vérifier si demande déjà envoyée (PENDING)
    const existingPending = await this.demandeAbonnementRepository.hasDemandePending(userId, dto.societe_id);
    if (existingPending) throw new ConflictException('Demande d\'abonnement déjà envoyée en attente de réponse');

    // Vérifier si déjà abonné
    const abonnementExistant = await this.abonnementRepo.findOne({
      where: {
        user_id: userId,
        societe_id: dto.societe_id,
      },
    });
    if (abonnementExistant) throw new ConflictException('Vous êtes déjà abonné à cette société');

    // Créer la demande
    const demande = this.demandeRepo.create({
      user_id: userId,
      societe_id: dto.societe_id,
      plan_demande: dto.plan_demande || AbonnementPlan.STANDARD,
      secteur_collaboration: dto.secteur_collaboration,
      role_utilisateur: dto.role_utilisateur,
      titre_partenariat: dto.titre_partenariat,
      description_partenariat: dto.description_partenariat,
      message: dto.message,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    });

    return this.demandeRepo.save(demande);
  }

  /**
   * Valider et normaliser le plan demandé
   */
  private normalizePlan(planDemande: string | null | undefined): AbonnementPlan {
    if (!planDemande) return AbonnementPlan.STANDARD;
    const normalized = planDemande.toLowerCase().trim();
    if (Object.values(AbonnementPlan).includes(normalized as AbonnementPlan)) {
      return normalized as AbonnementPlan;
    }
    return AbonnementPlan.STANDARD;
  }

  /**
   * Accepter une demande d'abonnement → Crée Suivre + Abonnement + PagePartenariat
   * Transaction atomique pour créer tout en même temps
   */
  async accepterDemande(demandeId: number, societeId: number): Promise<{
    demande: DemandeAbonnement;
    suivres: [Suivre, Suivre];
    abonnement: Abonnement;
    pagePartenariat: PagePartenariat;
  }> {
    // 1. Vérifications AVANT la transaction (lectures hors transaction)
    const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande d\'abonnement introuvable');

    if (demande.societe_id !== societeId) {
      throw new BadRequestException('Vous ne pouvez pas accepter cette demande');
    }

    if (!demande.canBeAccepted()) {
      throw new BadRequestException('Cette demande ne peut pas être acceptée (déjà traitée ou expirée)');
    }

    const user = await this.dataSource.getRepository(User).findOne({ where: { id: demande.user_id } });
    const societe = await this.dataSource.getRepository(Societe).findOne({ where: { id: demande.societe_id } });
    if (!user || !societe) throw new NotFoundException('User ou Société introuvable');

    // Vérifier si un abonnement existe déjà
    const existingAbonnement = await this.abonnementRepo.findOne({
      where: { user_id: demande.user_id, societe_id: demande.societe_id },
    });
    if (existingAbonnement) {
      throw new ConflictException('Un abonnement existe déjà entre cet utilisateur et cette société');
    }

    // 2. Transaction pour les écritures
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2a. Mettre à jour le statut de la demande
      demande.status = DemandeAbonnementStatus.ACCEPTED;
      demande.responded_at = new Date();
      await queryRunner.manager.save(DemandeAbonnement, demande);

      // 2b. Créer les Suivre mutuels (User ↔ Societe) si pas encore existants
      let savedSuivre1 = await queryRunner.manager.findOne(Suivre, {
        where: { user_id: demande.user_id, user_type: 'User', followed_id: demande.societe_id, followed_type: 'Societe' },
      });
      if (!savedSuivre1) {
        savedSuivre1 = queryRunner.manager.create(Suivre, {
          user_id: demande.user_id,
          user_type: 'User',
          followed_id: demande.societe_id,
          followed_type: 'Societe',
        });
        savedSuivre1 = await queryRunner.manager.save(Suivre, savedSuivre1);
      }

      let savedSuivre2 = await queryRunner.manager.findOne(Suivre, {
        where: { user_id: demande.societe_id, user_type: 'Societe', followed_id: demande.user_id, followed_type: 'User' },
      });
      if (!savedSuivre2) {
        savedSuivre2 = queryRunner.manager.create(Suivre, {
          user_id: demande.societe_id,
          user_type: 'Societe',
          followed_id: demande.user_id,
          followed_type: 'User',
        });
        savedSuivre2 = await queryRunner.manager.save(Suivre, savedSuivre2);
      }

      // 2c. Créer l'Abonnement
      const planValidated = this.normalizePlan(demande.plan_demande);
      const abonnement = queryRunner.manager.create(Abonnement, {
        user_id: demande.user_id,
        societe_id: demande.societe_id,
        statut: AbonnementStatut.ACTIVE,
        plan_collaboration: planValidated,
        secteur_collaboration: demande.secteur_collaboration || societe.secteur_activite || '',
        role_utilisateur: demande.role_utilisateur,
        date_debut: new Date(),
      });
      const savedAbonnement = await queryRunner.manager.save(Abonnement, abonnement);

      // 2d. Créer la PagePartenariat
      const nomUser = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
      const titreDefaut = `${societe.nom_societe || 'Société'} - ${nomUser}`;
      const pagePartenariat = queryRunner.manager.create(PagePartenariat, {
        abonnement_id: savedAbonnement.id,
        titre: demande.titre_partenariat || titreDefaut,
        description: demande.description_partenariat || `Partenariat ${societe.nom_societe || 'Société'} et ${nomUser}`,
        secteur_activite: demande.secteur_collaboration || societe.secteur_activite || '',
        visibilite: VisibilitePagePartenariat.PRIVATE,
        date_debut_partenariat: new Date(),
      });
      const savedPagePartenariat = await queryRunner.manager.save(PagePartenariat, pagePartenariat);

      // 2e. Mettre à jour l'abonnement avec la page
      savedAbonnement.page_partenariat_id = savedPagePartenariat.id;
      savedAbonnement.page_partenariat_creee = true;
      await queryRunner.manager.save(Abonnement, savedAbonnement);

      await queryRunner.commitTransaction();

      return {
        demande,
        suivres: [savedSuivre1, savedSuivre2],
        abonnement: savedAbonnement,
        pagePartenariat: savedPagePartenariat,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('[DemandeAbonnementService] accepterDemande transaction error:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refuser une demande d'abonnement
   */
  async refuserDemande(demandeId: number, societeId: number): Promise<DemandeAbonnement> {
    const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande introuvable');

    if (demande.societe_id !== societeId) {
      throw new BadRequestException('Vous ne pouvez pas refuser cette demande');
    }

    if (!demande.canBeAccepted()) {
      throw new BadRequestException('Cette demande ne peut pas être refusée (déjà traitée ou expirée)');
    }

    demande.status = DemandeAbonnementStatus.DECLINED;
    demande.responded_at = new Date();
    return this.demandeRepo.save(demande);
  }

  /**
   * Annuler une demande (par le user qui l'a envoyée)
   */
  async annulerDemande(demandeId: number, userId: number): Promise<void> {
    const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande introuvable');

    if (demande.user_id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas annuler cette demande');
    }

    if (demande.status !== DemandeAbonnementStatus.PENDING) {
      throw new BadRequestException('Impossible d\'annuler une demande déjà traitée');
    }

    await this.demandeRepo.remove(demande);
  }

  /**
   * Mes demandes envoyées
   */
  async getMesDemandesEnvoyees(userId: number, status?: DemandeAbonnementStatus): Promise<DemandeAbonnement[]> {
    return this.demandeAbonnementRepository.findDemandesEnvoyees(userId, status);
  }

  /**
   * Demandes reçues par une société
   */
  async getDemandesRecues(societeId: number, status?: DemandeAbonnementStatus): Promise<DemandeAbonnement[]> {
    return this.demandeAbonnementRepository.findDemandesRecues(societeId, status);
  }

  /**
   * Compter les demandes en attente
   */
  async countDemandesPending(societeId: number): Promise<number> {
    return this.demandeAbonnementRepository.countDemandesPending(societeId);
  }
}
