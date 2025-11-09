// modules/suivis/entities/demande-abonnement.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DemandeAbonnementStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

/**
 * DemandeAbonnement - Demandes d'abonnement DIRECT (sans suivre d'abord)
 *
 * Workflow:
 * 1. User clique "S'ABONNER" directement sur profil Societe (sans suivre d'abord)
 * 2. Crée DemandeAbonnement (status: PENDING)
 * 3a. Si ACCEPTÉE → Crée:
 *     - 2 Suivre mutuels (User ↔ Societe)
 *     - 1 Abonnement (User → Societe)
 *     - 1 PagePartenariat
 *     → User est directement SUIVI + ABONNÉ
 * 3b. Si DECLINED → Rien ne se passe
 *
 * Différence avec InvitationSuivi:
 * - InvitationSuivi: Demande de SUIVRE (sans abonnement)
 * - DemandeAbonnement: Demande d'ABONNEMENT direct (inclut suivre + abonnement + page)
 *
 * Important:
 * - UNIQUEMENT User → Societe (pas d'autres combinaisons)
 * - Plus "premium" qu'une simple invitation de suivi
 * - Crée immédiatement la relation business complète
 */
@Entity('demandes_abonnement')
@Index(['user_id', 'societe_id'], { unique: true })
@Index(['status'])
@Index(['societe_id'])
export class DemandeAbonnement {
  @PrimaryGeneratedColumn()
  id: number;

  // Qui demande l'abonnement (toujours un User)
  @Column({ type: 'int' })
  user_id: number;

  // À quelle Societe (toujours une Societe)
  @Column({ type: 'int' })
  societe_id: number;

  @Column({
    type: 'enum',
    enum: DemandeAbonnementStatus,
    enumName: 'demande_abonnement_status',
    name: 'status',
    default: DemandeAbonnementStatus.PENDING,
  })
  status: DemandeAbonnementStatus;

  // Informations pour l'abonnement
  @Column({ type: 'varchar', length: 100, nullable: true })
  plan_demande: string; // 'standard', 'premium', 'enterprise'

  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_collaboration: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_utilisateur: string;

  // Informations pour la PagePartenariat
  @Column({ type: 'varchar', length: 255, nullable: true })
  titre_partenariat: string;

  @Column({ type: 'text', nullable: true })
  description_partenariat: string;

  // Message de motivation
  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Méthodes helper
  isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  isPending(): boolean {
    return this.status === DemandeAbonnementStatus.PENDING && !this.isExpired();
  }

  canBeAccepted(): boolean {
    return this.isPending();
  }

  isAccepted(): boolean {
    return this.status === DemandeAbonnementStatus.ACCEPTED;
  }

  isDeclined(): boolean {
    return this.status === DemandeAbonnementStatus.DECLINED;
  }
}
