// modules/transactions/entities/transaction-collaboration.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Abonnement } from '../../suivis/entities/abonnement.entity';

export enum TransactionCollaborationStatut {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  SERVICE = 'service',
  PRODUIT = 'produit',
  COLLABORATION = 'collaboration',
  PARTENARIAT = 'partenariat',
}

@Entity('transaction_collaborations')
@Index(['user_id'])
@Index(['societe_id'])
@Index(['partenaire_id', 'partenaire_type'])
@Index(['statut']) // Propriété TypeScript (colonne 'statut' en base)
export class TransactionCollaboration {
  @PrimaryGeneratedColumn()
  id: number;

  // User principal (celui qui initie la transaction)
  @Column({ type: 'int', nullable: true })
  user_id: number;

  // Société principale (si la transaction est initiée par une société)
  @Column({ type: 'int', nullable: true })
  societe_id: number;

  // Abonnement associé (optionnel)
  @Column({ type: 'int', nullable: true })
  abonnement_id: number;

  // Partenaire (User ou Societe) - Relation polymorphique
  @Column({ type: 'int' })
  partenaire_id: number;

  @Column({ type: 'varchar', length: 100 })
  partenaire_type: string; // 'User' ou 'Societe'

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.COLLABORATION,
  })
  type: TransactionType;

  @Column({ type: 'varchar', length: 255 })
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  montant: number;

  @Column({ type: 'varchar', length: 10, default: 'EUR' })
  devise: string;

  @Column({
    type: 'enum',
    enum: TransactionCollaborationStatut,
    enumName: 'transaction_collaboration_statut',
    name: 'statut',
    default: TransactionCollaborationStatut.PENDING,
  })
  statut: TransactionCollaborationStatut;

  @Column({ type: 'date', nullable: true })
  date_debut: Date;

  @Column({ type: 'date', nullable: true })
  date_fin: Date;

  @Column({ type: 'json', nullable: true })
  documents: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  note_client: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  note_partenaire: number;

  @Column({ type: 'text', nullable: true })
  commentaire_client: string;

  @Column({ type: 'text', nullable: true })
  commentaire_partenaire: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.transactionsCollaboration, {
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Societe, { nullable: true })
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @ManyToOne(() => Abonnement, (abonnement) => abonnement.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'abonnement_id' })
  abonnement: Abonnement;

  // Méthodes helper
  isPartenaireUser(): boolean {
    return this.partenaire_type === 'User';
  }

  isPartenaireSociete(): boolean {
    return this.partenaire_type === 'Societe';
  }

  isPending(): boolean {
    return this.statut === TransactionCollaborationStatut.PENDING;
  }

  isInProgress(): boolean {
    return this.statut === TransactionCollaborationStatut.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.statut === TransactionCollaborationStatut.COMPLETED;
  }

  isCancelled(): boolean {
    return this.statut === TransactionCollaborationStatut.CANCELLED;
  }

  canBeRated(): boolean {
    return this.statut === TransactionCollaborationStatut.COMPLETED;
  }

  getDuration(): number | null {
    if (!this.date_debut || !this.date_fin) return null;
    const diff = this.date_fin.getTime() - this.date_debut.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // Retourne le nombre de jours
  }
}
