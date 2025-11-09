// modules/partenariats/entities/page-partenariat.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Abonnement } from '../../suivis/entities/abonnement.entity';
import { TransactionPartenariat } from './transaction-partenariat.entity';
import { InformationPartenaire } from './information-partenaire.entity';

/**
 * PagePartenariat est TOUJOURS privée entre User et Societe
 * Pas de visibilité publique possible pour respecter la confidentialité business
 */
export enum VisibilitePagePartenariat {
  PRIVATE = 'private',  // Uniquement User + Societe du partenariat
}

@Entity('pages_partenariat')
@Index(['abonnement_id'], { unique: true })
@Index(['visibilite'])
export class PagePartenariat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  abonnement_id: number;

  // Branding et présentation
  @Column({ type: 'varchar', length: 255 })
  titre: string; // Ex: "Partenariat SOFITEX - Jean Dupont"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  couleur_theme: string; // Ex: "#1E4A8C"

  // Stats calculées et affichées
  @Column({ type: 'int', default: 0 })
  total_transactions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  montant_total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_debut_partenariat: Date;

  @Column({ type: 'timestamp', nullable: true })
  derniere_transaction_at: Date;

  // Visibilité
  @Column({
    type: 'enum',
    enum: VisibilitePagePartenariat,
    enumName: 'visibilite_page_partenariat',
    name: 'visibilite',
    default: VisibilitePagePartenariat.PRIVATE,
  })
  visibilite: VisibilitePagePartenariat;

  // Secteur d'activité du partenariat
  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_activite: string; // Ex: "Agriculture - Coton"

  // Statut de la page
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Métadonnées JSON pour données supplémentaires
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Abonnement, (abonnement) => abonnement.pagePartenariat)
  @JoinColumn({ name: 'abonnement_id' })
  abonnement: Abonnement;

  @OneToMany(
    () => TransactionPartenariat,
    (transaction) => transaction.pagePartenariat,
  )
  transactions: TransactionPartenariat[];

  @OneToMany(
    () => InformationPartenaire,
    (information) => information.pagePartenariat,
  )
  informations: InformationPartenaire[];

  // Méthodes helper
  isPrivate(): boolean {
    return this.visibilite === VisibilitePagePartenariat.PRIVATE;
  }

  // Vérifier si un utilisateur peut accéder à cette page
  canBeAccessedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.abonnement) return false;

    return (
      (actorType === 'User' && this.abonnement.user_id === actorId) ||
      (actorType === 'Societe' && this.abonnement.societe_id === actorId)
    );
  }

  updateStats(
    totalTransactions: number,
    montantTotal: number,
    derniereTransactionAt: Date,
  ): void {
    this.total_transactions = totalTransactions;
    this.montant_total = montantTotal;
    this.derniere_transaction_at = derniereTransactionAt;
  }
}
