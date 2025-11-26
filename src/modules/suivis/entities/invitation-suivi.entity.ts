// modules/suivis/entities/invitation-suivi.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InvitationSuiviStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

/**
 * InvitationSuivi - Demandes de suivi entre utilisateurs/sociétés
 *
 * Flux:
 * 1. User A (ou Societe A) clique "Suivre" sur profil de User B ou Societe C
 * 2. Crée InvitationSuivi (status: PENDING)
 * 3a. Si ACCEPTED → Crée 2 Suivre mutuels (bidirectionnel)
 *     → Peut créer Groupe privé pour communiquer
 * 3b. Si DECLINED → Rien ne se passe
 */
@Entity('invitations_suivi')
@Index(['sender_id', 'sender_type', 'receiver_id', 'receiver_type'], { unique: true })
@Index(['status']) // Propriété TypeScript (colonne 'statut' en base)
@Index(['receiver_id', 'receiver_type'])
@Index(['sender_id', 'sender_type'])
export class InvitationSuivi {
  @PrimaryGeneratedColumn()
  id: number;

  // Qui envoie l'invitation (User OU Societe - polymorphique)
  @Column({ type: 'int' })
  sender_id: number;

  @Column({ type: 'varchar', length: 100 })
  sender_type: string; // 'User' ou 'Societe'

  // À qui l'invitation est envoyée (User OU Societe - polymorphique)
  @Column({ type: 'int' })
  receiver_id: number;

  @Column({ type: 'varchar', length: 100 })
  receiver_type: string; // 'User' ou 'Societe'

  @Column({
    type: 'enum',
    enum: InvitationSuiviStatus,
    default: InvitationSuiviStatus.PENDING,
    name: 'statut', // Nom de la colonne en base (français)
    enumName: 'invitation_statut', // Nom de l'enum PostgreSQL partagé
  })
  status: InvitationSuiviStatus;

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

  // Relations
  // Note: sender et target sont polymorphiques (User ou Societe)
  // Pas de @ManyToOne car polymorphique - utiliser un service pour récupérer les entités

  // Méthodes helper
  isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  isPending(): boolean {
    return this.status === InvitationSuiviStatus.PENDING && !this.isExpired();
  }

  canBeAccepted(): boolean {
    return this.isPending();
  }

  isSenderUser(): boolean {
    return this.sender_type === 'User';
  }

  isSenderSociete(): boolean {
    return this.sender_type === 'Societe';
  }

  isReceiverUser(): boolean {
    return this.receiver_type === 'User';
  }

  isReceiverSociete(): boolean {
    return this.receiver_type === 'Societe';
  }
}
