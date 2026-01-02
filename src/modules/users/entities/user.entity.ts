// modules/users/entities/user.entity.ts
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
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserProfil } from './user-profil.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Groupe } from '../../groupes/entities/groupe.entity';
import { GroupeInvitation } from '../../groupes/entities/groupe-invitation.entity';
import { TransactionCollaboration } from '../../transactions/entities/transaction-collaboration.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Entity('users')
@Index(['nom'])
@Index(['prenom'])
@Index(['email'])
@Index(['numero'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column({ length: 255 })
  prenom: string;

  @Column({ length: 20, unique: true })
  numero: string;

  @Column({ length: 255, nullable: true, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  activite: string;

  @Column({ type: 'date' })
  date_naissance: Date;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @Column({ type: 'boolean', default: false })
  is_phone_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  phone_verified_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONS =====

  // Profil utilisateur (OneToOne)
  @OneToOne(() => UserProfil, (profil) => profil.user, { cascade: true })
  profile: UserProfil;

  // Sociétés auxquelles appartient l'utilisateur (ManyToMany)
  @ManyToMany(() => Societe, (societe) => societe.membres)
  @JoinTable({
    name: 'societe_user',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'societe_id', referencedColumnName: 'id' },
  })
  societes: Societe[];

  // Groupes dont l'utilisateur est membre (ManyToMany)
  @ManyToMany(() => Groupe, (groupe) => groupe.membres)
  groupes: Groupe[];

  // Groupes créés par cet utilisateur (relation polymorphique)
  // Note: Dans TypeORM, les relations polymorphiques sont gérées manuellement
  // via les colonnes created_by_id et created_by_type dans l'entité Groupe

  // Invitations reçues (OneToMany)
  @OneToMany(() => GroupeInvitation, (invitation) => invitation.invitedUser)
  invitationsRecues: GroupeInvitation[];

  // Invitations envoyées (OneToMany)
  @OneToMany(() => GroupeInvitation, (invitation) => invitation.invitedByUser)
  invitationsEnvoyees: GroupeInvitation[];

  // Posts créés par cet utilisateur (relation polymorphique)
  // Note: Relation virtuelle - les posts sont filtrés par posted_by_id et posted_by_type
  // Utiliser le service PostPolymorphicService pour récupérer les posts
  // Exemple: postPolymorphicService.getPostsByUser(userId)

  // Notifications (polymorphique - pas de relation TypeORM)
  // Utiliser le service NotificationService pour récupérer les notifications
  // Exemple: notificationService.getNotifications(userId, 'User')

  // Transactions en tant que client principal (OneToMany)
  @OneToMany(
    () => TransactionCollaboration,
    (transaction) => transaction.user,
  )
  transactionsCollaboration: TransactionCollaboration[];

  // Transactions en tant que partenaire (relation polymorphique)
  // Géré manuellement via partenaire_id et partenaire_type

  // ===== MÉTHODES HELPER =====

  // Propriété virtuelle pour l'âge
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.date_naissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Obtenir le nom complet
  get fullName(): string {
    return `${this.prenom} ${this.nom}`;
  }

  // Vérifier si l'utilisateur appartient à une société
  belongsToSociete(societeId: number, societes?: Societe[]): boolean {
    if (!societes || societes.length === 0) return false;
    return societes.some((s) => s.id === societeId);
  }

  // Vérifier si l'utilisateur est admin d'une société
  isAdminOfSociete(_societeId: number): boolean {
    // Cette logique nécessite de charger les relations avec les pivots
    // Pour l'instant, c'est une méthode placeholder
    return false;
  }

  // Note: Pour récupérer les posts, likes et commentaires créés par cet utilisateur,
  // utilisez les services polymorphiques correspondants:
  // - PostPolymorphicService.getPostsByUser(userId)
  // - LikePolymorphicService.getLikesByUser(userId) [à créer]
  // - CommentairePolymorphicService.getCommentairesByUser(userId) [à créer]
  //
  // Ces relations sont polymorphiques et ne peuvent pas être gérées directement
  // par TypeORM avec @OneToMany comme dans Laravel
}