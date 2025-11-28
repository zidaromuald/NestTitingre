// modules/partenariats/entities/information-partenaire.entity.ts
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
import { PagePartenariat } from './page-partenariat.entity';

export enum PartenaireType {
  USER = 'USER',
  SOCIETE = 'SOCIETE',
}

export enum ModifiablePar {
  USER = 'user',
  SOCIETE = 'societe',
  LES_DEUX = 'les_deux',
}

@Entity('informations_partenaires')
@Index(['page_partenariat_id', 'partenaire_type'])
@Index(['partenaire_id', 'partenaire_type'])
export class InformationPartenaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  page_partenariat_id: number;

  // Type polymorphique
  @Column({ type: 'int' })
  partenaire_id: number;

  @Column({
    type: 'enum',
    enum: PartenaireType,
  })
  partenaire_type: PartenaireType;

  // Informations générales
  @Column({ type: 'varchar', length: 255 })
  nom_affichage: string; // Nom à afficher sur la page

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url: string;

  // Informations de contact
  @Column({ type: 'varchar', length: 255, nullable: true })
  localite: string; // Ex: "Sorano (Champs) Uber"

  @Column({ type: 'text', nullable: true })
  adresse_complete: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numero_telephone: string; // Ex: "+226-08-07-80-14"

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_contact: string;

  // Secteur d'activité
  @Column({ type: 'varchar', length: 255 })
  secteur_activite: string; // Ex: "Agriculture", "Textile"

  // ===== Informations Agriculture (pour User agriculteur) =====
  @Column({ type: 'varchar', length: 100, nullable: true })
  superficie: string; // Ex: "4 Hectares"

  @Column({ type: 'varchar', length: 255, nullable: true })
  type_culture: string; // Ex: "Coton", "Maïs", "Riz"

  @Column({ type: 'varchar', length: 255, nullable: true })
  maison_etablissement: string; // Ex: "SORO, KTF"

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_controleur: string; // Ex: "Contrôleur de User"

  // ===== Informations Entreprise (pour Societe) =====
  @Column({ type: 'varchar', length: 255, nullable: true })
  siege_social: string; // Ex: "Bobo-Dioulasso"

  @Column({ type: 'date', nullable: true })
  date_creation: Date; // Ex: "2003"

  @Column({ type: 'json', nullable: true })
  certificats: string[]; // URLs des certificats

  @Column({ type: 'varchar', length: 100, nullable: true })
  numero_registration: string; // Numéro d'immatriculation

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  capital_social: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  chiffre_affaires: number;

  // ===== Informations Communes =====
  @Column({ type: 'int', nullable: true })
  nombre_employes: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type_organisation: string; // Ex: "Coopérative", "SA", "SARL"

  // Qui a créé cette information (pour permissions)
  @Column({
    type: 'enum',
    enum: PartenaireType,
  })
  creee_par: PartenaireType;  // 'User' ou 'Societe'

  // Permissions de modification
  @Column({
    type: 'enum',
    enum: ModifiablePar,
    default: ModifiablePar.SOCIETE,
  })
  modifiable_par: ModifiablePar;

  // Visibilité des informations
  @Column({ type: 'boolean', default: true })
  visible_sur_page: boolean;

  // Métadonnées JSON pour flexibilité
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => PagePartenariat, (page) => page.informations)
  @JoinColumn({ name: 'page_partenariat_id' })
  pagePartenariat: PagePartenariat;

  // Méthodes helper
  isUser(): boolean {
    return this.partenaire_type === PartenaireType.USER;
  }

  isSociete(): boolean {
    return this.partenaire_type === PartenaireType.SOCIETE;
  }

  peutEtreModifiePar(type: 'user' | 'societe'): boolean {
    return (
      this.modifiable_par === type ||
      this.modifiable_par === ModifiablePar.LES_DEUX
    );
  }

  isAgricole(): boolean {
    return !!(
      this.secteur_activite &&
      this.secteur_activite.toLowerCase().includes('agricul')
    );
  }

  // ==================== MÉTHODES DE PERMISSIONS ====================

  /**
   * Vérifier si un acteur peut VOIR cette information
   *
   * Logique : User ET Societe du partenariat peuvent voir TOUTES les infos
   */
  canBeViewedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    const abonnement = this.pagePartenariat.abonnement;

    return (
      (actorType === 'User' && abonnement.user_id === actorId) ||
      (actorType === 'Societe' && abonnement.societe_id === actorId)
    );
  }

  /**
   * Vérifier si un acteur peut MODIFIER cette information
   *
   * Logique : Selon le champ modifiable_par
   * - USER : Seul le User peut modifier
   * - SOCIETE : Seule la Societe peut modifier
   * - LES_DEUX : Les deux peuvent modifier
   */
  canBeModifiedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    const abonnement = this.pagePartenariat.abonnement;

    // Vérifier que c'est bien un membre du partenariat
    const isPartOfPartnership =
      (actorType === 'User' && abonnement.user_id === actorId) ||
      (actorType === 'Societe' && abonnement.societe_id === actorId);

    if (!isPartOfPartnership) return false;

    // Vérifier les permissions selon modifiable_par
    if (this.modifiable_par === ModifiablePar.LES_DEUX) {
      return true;
    }

    if (this.modifiable_par === ModifiablePar.USER) {
      return actorType === 'User';
    }

    if (this.modifiable_par === ModifiablePar.SOCIETE) {
      return actorType === 'Societe';
    }

    return false;
  }

  /**
   * Vérifier si un acteur peut modifier ses PROPRES informations uniquement
   *
   * Logique : Chacun ne peut modifier QUE les infos qu'il a créées
   */
  canBeModifiedByOwner(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    // Vérifier que l'acteur est bien le créateur de cette information
    const isOwner =
      this.creee_par === PartenaireType[actorType.toUpperCase() as keyof typeof PartenaireType] &&
      this.partenaire_id === actorId;

    return isOwner;
  }

  /**
   * Vérifier si un acteur peut SUPPRIMER cette information
   *
   * Logique : Uniquement le créateur de l'information peut la supprimer
   */
  canBeDeletedBy(actorId: number, actorType: 'User' | 'Societe'): boolean {
    if (!this.pagePartenariat?.abonnement) return false;

    // Uniquement le créateur peut supprimer
    return (
      this.creee_par === PartenaireType[actorType.toUpperCase() as keyof typeof PartenaireType] &&
      this.partenaire_id === actorId
    );
  }
}
