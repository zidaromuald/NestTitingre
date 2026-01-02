// modules/groupes/entities/groupe.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { GroupeProfil } from './groupe-profil.entity';
import { GroupeInvitation } from './groupe-invitation.entity';
import { Post } from '../../posts/entities/post.entity';

export enum GroupeType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  MEMBERS_ONLY = 'members_only',
}

export enum GroupeCategorie {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum MembreRole {
  MEMBRE = 'membre',
  MODERATEUR = 'moderateur',
  ADMIN = 'admin',
}

export enum MembreStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

@Entity('groupes')
export class Groupe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relations polymorphiques pour le créateur (User ou Societe)
  @Column({ type: 'int' })
  created_by_id: number;

  @Column({ type: 'varchar', length: 100 })
  created_by_type: string; // 'User' ou 'Societe'

  @Column({
    name: 'visibilite',
    type: 'enum',
    enum: GroupeType,
    default: GroupeType.PUBLIC,
  })
  type: GroupeType;

  @Column({ type: 'int', default: 50 })
  max_membres: number;

  @Column({
    name: 'statut',
    type: 'enum',
    enum: GroupeCategorie,
    default: GroupeCategorie.ACTIVE,
  })
  categorie: GroupeCategorie;

  // Admin désigné (pour les groupes créés par société)
  @Column({ type: 'int', nullable: true })
  admin_user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => GroupeProfil, (profil) => profil.groupe, { cascade: true })
  profil: GroupeProfil;

  @ManyToMany(() => User, (user) => user.groupes)
  @JoinTable({
    name: 'groupe_users',
    joinColumn: { name: 'groupe_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'member_id', referencedColumnName: 'id' },
  })
  membres: User[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'admin_user_id' })
  adminDesigne: User;

  @OneToMany(() => GroupeInvitation, (invitation) => invitation.groupe)
  invitations: GroupeInvitation[];

  @OneToMany(() => Post, (post) => post.groupe)
  posts: Post[];

  // @OneToMany(() => MessageGroupe, (message) => message.groupe)
  // messages: MessageGroupe[];

  // Méthodes helper
  isCreatedBySociete(): boolean {
    return this.created_by_type === 'Societe';
  }

  isCreatedByUser(): boolean {
    return this.created_by_type === 'User';
  }

  isFull(membresCount: number): boolean {
    return membresCount >= this.max_membres;
  }

  // Note: Cette méthode n'est plus pertinente car categorie représente maintenant le statut
  // Pour déterminer la taille du groupe, utilisez directement max_membres ou comptez les membres
  getCategorieByMembersCount(membresCount: number): string {
    if (membresCount >= 10000) {
      return 'supergroupe';
    } else if (membresCount >= 101) {
      return 'professionnel';
    } else {
      return 'simple';
    }
  }
}
