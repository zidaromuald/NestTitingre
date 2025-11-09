// modules/societes/entities/societe.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SocieteProfil } from './societe-profil.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionCollaboration } from '../../transactions/entities/transaction-collaboration.entity';

@Entity('societes')
@Index(['nom_societe'])
@Index(['email'])
@Index(['numero'])
@Index(['secteur_activite'])
@Index(['secteur_activite', 'type_produit']) // Index composé pour recherche avancée
export class Societe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nom_societe: string;

  @Column({ length: 20, unique: true })
  numero: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  centre_interet: string;

  @Column({ length: 255 })
  secteur_activite: string;

  @Column({ length: 255 })
  type_produit: string;

  @Column({ length: 255, nullable: true })
  adresse: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONS =====

  // Profil de la société (OneToOne)
  @OneToOne(() => SocieteProfil, (profil) => profil.societe, { cascade: true })
  profile: SocieteProfil;

  // Utilisateurs membres de cette société (ManyToMany)
  @ManyToMany(() => User, (user) => user.societes)
  membres: User[];

  // Groupes créés par cette société (relation polymorphique)
  // Géré manuellement via created_by_id et created_by_type dans Groupe

  // Posts créés par cette société (relation polymorphique)
  // Note: Relation virtuelle - utiliser PostPolymorphicService.getPostsBySociete(societeId)

  // Likes donnés par cette société (relation polymorphique)
  // Note: Relation virtuelle - utiliser LikePolymorphicService.getLikesBySociete(societeId)

  // Commentaires créés par cette société (relation polymorphique)
  // Note: Relation virtuelle - utiliser CommentairePolymorphicService.getCommentairesBySociete(societeId)

  // Transactions en tant que société principale (OneToMany)
  @OneToMany(
    () => TransactionCollaboration,
    (transaction) => transaction.societe,
  )
  transactionsCollaboration: TransactionCollaboration[];

  // Transactions en tant que partenaire (relation polymorphique)
  // Géré manuellement via partenaire_id et partenaire_type

  // ===== MÉTHODES HELPER =====

  // Nom d'affichage (pour compatibilité avec User)
  get displayName(): string {
    return this.nom_societe;
  }

  // Vérifier si un utilisateur appartient à cette société
  hasUser(userId: number, membres?: User[]): boolean {
    if (!membres || membres.length === 0) return false;
    return membres.some((u) => u.id === userId);
  }

  // Obtenir les admins de la société
  // Note: nécessite de charger la relation avec les pivots
  getAdmins(_membres?: User[]): User[] {
    // Pour l'instant, retourne un tableau vide
    // La logique complète nécessite les données pivot
    return [];
  }

  // Note: Pour récupérer les posts, likes et commentaires créés par cette société,
  // utilisez les services polymorphiques correspondants:
  // - PostPolymorphicService.getPostsBySociete(societeId)
  // - LikePolymorphicService.getLikesBySociete(societeId) [à créer]
  // - CommentairePolymorphicService.getCommentairesBySociete(societeId) [à créer]
}
