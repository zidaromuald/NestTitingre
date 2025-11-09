// modules/partenariats/entities/transaction-partenariat.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { PagePartenariat } from './page-partenariat.entity';

export enum TransactionPartenaritStatut {
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

@Entity('transactions_partenariat')
@Index(['page_partenariat_id'])
@Index(['statut'])
@Index(['date_debut', 'date_fin'])
export class TransactionPartenariat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  page_partenariat_id: number;

  // Période de la transaction
  @Column({ type: 'date' })
  date_debut: Date;

  @Column({ type: 'date' })
  date_fin: Date;

  @Column({ type: 'varchar', length: 100 })
  periode_label: string; // Ex: "Janvier à Mars 2023"

  // Produit/Service
  @Column({ type: 'varchar', length: 255 })
  produit: string; // Ex: "Coton"

  @Column({ type: 'varchar', length: 100, nullable: true })
  categorie: string; // Ex: "Agriculture", "Textile"

  // Quantités
  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantite: number; // Ex: 2038

  @Column({ type: 'varchar', length: 50 })
  unite: string; // Ex: "Kg", "Tonnes", "Unités"

  // Prix
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  prix_unitaire: number; // Ex: 1000

  @Column({ type: 'varchar', length: 10, default: 'CFA' })
  devise: string; // Ex: "CFA", "EUR"

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  prix_total: number; // Calculé automatiquement

  // Statut
  @Column({
    type: 'enum',
    enum: TransactionPartenaritStatut,
    enumName: 'transaction_partenariat_statut',
    name: 'statut',
    default: TransactionPartenaritStatut.PENDING_VALIDATION,
  })
  statut: TransactionPartenaritStatut;

  // Validation (SEULE LA SOCIETE peut créer/modifier)
  @Column({ type: 'boolean', default: true })
  creee_par_societe: boolean;

  @Column({ type: 'boolean', default: false })
  validee_par_user: boolean;

  @Column({ type: 'timestamp', nullable: true })
  date_validation_user: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_modification_societe: Date;

  // Documents et preuves
  @Column({ type: 'json', nullable: true })
  documents: string[]; // URLs des factures, bordereaux, etc.

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  commentaire_user: string; // Commentaire du User lors validation

  // Métadonnées
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => PagePartenariat, (page) => page.transactions)
  @JoinColumn({ name: 'page_partenariat_id' })
  pagePartenariat: PagePartenariat;

  // Hooks pour calculer automatiquement le prix total
  @BeforeInsert()
  @BeforeUpdate()
  calculatePrixTotal() {
    this.prix_total = this.quantite * this.prix_unitaire;
  }

  // Méthodes helper
  isPendingValidation(): boolean {
    return this.statut === TransactionPartenaritStatut.PENDING_VALIDATION;
  }

  isValidated(): boolean {
    return this.statut === TransactionPartenaritStatut.VALIDATED;
  }

  isRejected(): boolean {
    return this.statut === TransactionPartenaritStatut.REJECTED;
  }

  canBeValidatedByUser(): boolean {
    return (
      this.creee_par_societe &&
      !this.validee_par_user &&
      this.isPendingValidation()
    );
  }

  validateByUser(commentaire?: string): void {
    this.validee_par_user = true;
    this.date_validation_user = new Date();
    this.statut = TransactionPartenaritStatut.VALIDATED;
    if (commentaire) {
      this.commentaire_user = commentaire;
    }
  }

  reject(): void {
    this.statut = TransactionPartenaritStatut.REJECTED;
  }

  getDuree(): number {
    // Retourne la durée en jours
    const diff = this.date_fin.getTime() - this.date_debut.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ==================== MÉTHODES DE PERMISSIONS ====================

  /**
   * Vérifier si un acteur peut VOIR cette transaction
   *
   * Logique :
   * - Société : voit TOUTES les transactions
   * - User : voit UNIQUEMENT les transactions EN_ATTENTE_VALIDATION (pour valider)
   */
  canBeViewedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    const abonnement = this.pagePartenariat.abonnement;

    // Société voit TOUTES les transactions (gestion complète)
    if (actorType === 'Societe' && abonnement.societe_id === actorId) {
      return true;
    }

    // User voit UNIQUEMENT les transactions en attente de validation
    if (actorType === 'User' && abonnement.user_id === actorId) {
      return this.statut === TransactionPartenaritStatut.PENDING_VALIDATION;
    }

    return false;
  }

  /**
   * Vérifier si un acteur peut CRÉER une transaction
   *
   * Logique : UNIQUEMENT l'admin de la Société peut créer des transactions
   */
  static canBeCreatedBy(actorType: 'User' | 'Societe'): boolean {
    return actorType === 'Societe';
  }

  /**
   * Vérifier si un acteur peut MODIFIER cette transaction
   *
   * Logique :
   * - Société : peut modifier si pas encore validée par User
   * - User : CANNOT modifier (peut seulement valider via canBeValidatedBy)
   */
  canBeModifiedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    const abonnement = this.pagePartenariat.abonnement;

    // Société peut modifier uniquement si pas encore validée
    if (actorType === 'Societe' && abonnement.societe_id === actorId) {
      return !this.validee_par_user;
    }

    // User ne peut jamais modifier les détails (quantité, prix, etc.)
    return false;
  }

  /**
   * Vérifier si un User peut VALIDER cette transaction
   *
   * Logique : User du partenariat peut valider si statut EN_ATTENTE_VALIDATION
   */
  canBeValidatedBy(userId: number): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    return (
      this.pagePartenariat.abonnement.user_id === userId &&
      this.statut === TransactionPartenaritStatut.PENDING_VALIDATION &&
      !this.validee_par_user
    );
  }

  /**
   * Vérifier si un acteur peut SUPPRIMER cette transaction
   *
   * Logique : Uniquement Société, et uniquement si pas validée
   */
  canBeDeletedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    return (
      actorType === 'Societe' &&
      this.pagePartenariat.abonnement.societe_id === actorId &&
      !this.validee_par_user
    );
  }
}
