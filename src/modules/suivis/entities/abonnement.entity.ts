// modules/suivis/entities/abonnement.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Groupe } from '../../groupes/entities/groupe.entity';
import { TransactionCollaboration } from '../../transactions/entities/transaction-collaboration.entity';
import { MessageCollaboration } from '../../messages/entities/message-collaboration.entity';
import { PagePartenariat } from '../../partenariats/entities/page-partenariat.entity';

export enum AbonnementStatut {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export enum AbonnementPlan {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Abonnement - Upgrade d'un Suivre (User → Societe) vers collaboration business
 *
 * Workflow:
 * 1. User suit une Societe (crée Suivre avec user_type='User', followed_type='Societe')
 * 2. User clique "S'ABONNER" (différent de "Suivre")
 * 3. Crée Abonnement + PagePartenariat automatiquement
 * 4. Permet collaboration business, transactions, gestion de compte
 *
 * Important:
 * - UNIQUEMENT pour User qui suit Societe (pas Societe→Societe, ni User→User)
 * - Relation OneToOne avec Suivre (via user_id + societe_id)
 * - Crée automatiquement PagePartenariat pour gérer la collaboration
 */
@Entity('abonnements')
@Index(['user_id', 'societe_id'], { unique: true })
@Index(['statut'])
@Index(['plan_collaboration'])
export class Abonnement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  societe_id: number;

  @Column({
    type: 'enum',
    enum: AbonnementStatut,
    enumName: 'abonnement_statut',
    name: 'statut',
    default: AbonnementStatut.ACTIVE,
  })
  statut: AbonnementStatut;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_debut: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_fin: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_collaboration: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_utilisateur: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  solde_compte: number;

  @Column({
    type: 'enum',
    enum: AbonnementPlan,
    default: AbonnementPlan.STANDARD, 
  })
  plan_collaboration: AbonnementPlan;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ type: 'int', nullable: true })
  groupe_collaboration_id: number;

  @Column({ type: 'int', nullable: true })
  page_partenariat_id: number;

  @Column({ type: 'boolean', default: false })
  page_partenariat_creee: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  notifications_transactions: boolean;

  @Column({ type: 'boolean', default: true })
  notifications_email_business: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Societe)
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @ManyToOne(() => Groupe, { nullable: true })
  @JoinColumn({ name: 'groupe_collaboration_id' })
  groupeCollaboration: Groupe;

  @OneToOne(() => PagePartenariat, (page) => page.abonnement, { nullable: true })
  @JoinColumn({ name: 'page_partenariat_id' })
  pagePartenariat: PagePartenariat;

  @OneToMany(() => TransactionCollaboration, (transaction) => transaction.abonnement)
  transactions: TransactionCollaboration[];

  @OneToMany(() => MessageCollaboration, (message) => message.abonnement)
  messages: MessageCollaboration[];

  // Méthodes helper
  isActive(): boolean {
    return this.statut === AbonnementStatut.ACTIVE;
  }

  isPlanStandard(): boolean {
    return this.plan_collaboration === AbonnementPlan.STANDARD;
  }

  isPlanPremium(): boolean {
    return this.plan_collaboration === AbonnementPlan.PREMIUM;
  }

  isPlanEnterprise(): boolean {
    return this.plan_collaboration === AbonnementPlan.ENTERPRISE;
  }

  hasPermission(permission: string): boolean {
    return this.permissions && this.permissions.includes(permission);
  }

  peutUpgraderVers(nouveauPlan: AbonnementPlan): boolean {
    const plansHierarchie = [
      AbonnementPlan.STANDARD,
      AbonnementPlan.PREMIUM,
      AbonnementPlan.ENTERPRISE,
    ];

    const indexActuel = plansHierarchie.indexOf(this.plan_collaboration);
    const indexNouveau = plansHierarchie.indexOf(nouveauPlan);

    return indexNouveau > indexActuel;
  }
}
