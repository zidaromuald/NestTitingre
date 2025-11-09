// modules/suivis/entities/suivre.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Abonnement } from './abonnement.entity';

/**
 * Suivre - Connexions mutuelles établies APRÈS acceptation d'invitation
 *
 * Cette entité est créée UNIQUEMENT après qu'une InvitationSuivi soit ACCEPTÉE
 *
 * Fonctionnalités:
 * - User A et User B se suivent mutuellement (2 entrées: A→B et B→A)
 * - Societe X et User C se suivent mutuellement (2 entrées: X→C et C→X)
 * - Societe Y et Societe Z se suivent mutuellement (2 entrées: Y→Z et Z→Y)
 * - Permet de créer des Groupes privés pour communication (texte, vocal, image, vidéo)
 * - Permet d'intégrer d'autres personnes qu'on suit mutuellement dans les groupes
 *
 * Important:
 * - Relations COMPLÈTEMENT POLYMORPHIQUES des deux côtés
 * - Pour Societe: possibilité d'upgrade vers Abonnement (crée PagePartenariat)
 * - Abonnement = collaboration business dans le même secteur d'activité
 */
@Entity('suivis')
@Index(['user_id', 'user_type', 'followed_id', 'followed_type'], { unique: true })
@Index(['derniere_interaction'])
@Index(['followed_id', 'followed_type'])
@Index(['user_id', 'user_type'])
export class Suivre {
  @PrimaryGeneratedColumn()
  id: number;

  // Qui suit (User OU Societe - polymorphique)
  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  user_type: string; // 'User' ou 'Societe'

  // Qui est suivi (User OU Societe - polymorphique)
  @Column({ type: 'int' })
  followed_id: number;

  @Column({ type: 'varchar', length: 100 })
  followed_type: string; // 'User' ou 'Societe'

  // Préférences de notifications
  @Column({ type: 'boolean', default: true })
  notifications_posts: boolean;

  @Column({ type: 'boolean', default: false })
  notifications_email: boolean;

  // Tracking de l'activité
  @Column({ type: 'timestamp', nullable: true })
  derniere_visite: Date;

  @Column({ type: 'timestamp', nullable: true })
  derniere_interaction: Date;

  // Compteurs d'engagement
  @Column({ type: 'int', default: 0 })
  total_likes: number;

  @Column({ type: 'int', default: 0 })
  total_commentaires: number;

  @Column({ type: 'int', default: 0 })
  total_partages: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  // Note: user et followed sont polymorphiques (User ou Societe)
  // Pas de @ManyToOne car polymorphique - utiliser SuivrePolymorphicService

  // Relation avec Abonnement (UNIQUEMENT si user_type='User' ET followed_type='Societe')
  // Créé via le bouton "S'ABONNER" (différent de "Suivre")
  @OneToOne(() => Abonnement, { nullable: true })
  @JoinColumn([
    { name: 'user_id', referencedColumnName: 'user_id' },
    { name: 'followed_id', referencedColumnName: 'societe_id' },
  ])
  abonnement: Abonnement;

  // Méthodes helper - Type user (qui suit)
  isUserTypeUser(): boolean {
    return this.user_type === 'User';
  }

  isUserTypeSociete(): boolean {
    return this.user_type === 'Societe';
  }

  // Méthodes helper - Type followed (qui est suivi)
  isFollowingUser(): boolean {
    return this.followed_type === 'User';
  }

  isFollowingSociete(): boolean {
    return this.followed_type === 'Societe';
  }

  // Méthodes helper - Tracking
  marquerVisite(): void {
    this.derniere_visite = new Date();
  }

  incrementerLike(): void {
    this.total_likes++;
    this.derniere_interaction = new Date();
  }

  incrementerCommentaire(): void {
    this.total_commentaires++;
    this.derniere_interaction = new Date();
  }

  incrementerPartage(): void {
    this.total_partages++;
    this.derniere_interaction = new Date();
  }

  // Calcul du score d'engagement
  calculerScoreEngagement(): number {
    const joursDepuisCreation = Math.floor(
      (new Date().getTime() - this.created_at.getTime()) / (1000 * 60 * 60 * 24),
    );

    const joursDepuisDerniereInteraction = this.derniere_interaction
      ? Math.floor(
          (new Date().getTime() - this.derniere_interaction.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : joursDepuisCreation;

    if (joursDepuisCreation === 0) return 0;

    const scoreInteractions =
      this.total_likes +
      this.total_commentaires * 2 +
      this.total_partages * 3;

    const scoreRecence =
      Math.max(0, 30 - joursDepuisDerniereInteraction) / 30;

    return (scoreInteractions / joursDepuisCreation) * scoreRecence;
  }

  // Vérifier si peut upgrader vers abonnement
  // Seulement possible si on suit une Societe et qu'on n'a pas déjà d'abonnement
  peutUpgraderVersAbonnement(): boolean {
    return this.isFollowingSociete() && !this.abonnement;
  }

  // Vérifier si a un abonnement actif
  hasAbonnement(): boolean {
    return !!this.abonnement;
  }
}
