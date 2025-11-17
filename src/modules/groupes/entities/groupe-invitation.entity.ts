// modules/groupes/entities/groupe-invitation.entity.ts
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
import { Groupe } from './groupe.entity';
import { User } from '../../users/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('groupe_invitations')
@Index(['groupe_id', 'invited_id', 'invited_type'])
@Index(['status']) // Propriété TypeScript (colonne 'statut' en base)
export class GroupeInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  groupe_id: number;

  @Column({ type: 'int' })
  invited_id: number;

  @Column({ type: 'varchar', length: 100 })
  invited_type: string;

  @Column({ type: 'int' })
  inviter_id: number;

  @Column({ type: 'varchar', length: 100 })
  inviter_type: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
    name: 'statut', // Nom de la colonne en base (français)
    enumName: 'invitation_statut', // Nom de l'enum PostgreSQL
  })
  status: InvitationStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe, (groupe) => groupe.invitations)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => User, (user) => user.invitationsRecues)
  @JoinColumn({ name: 'invited_id' })
  invitedUser: User;

  @ManyToOne(() => User, (user) => user.invitationsEnvoyees)
  @JoinColumn({ name: 'inviter_id' })
  invitedByUser: User;

  // Méthodes helper
  isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  isPending(): boolean {
    return this.status === InvitationStatus.PENDING && !this.isExpired();
  }

  canBeAccepted(): boolean {
    return this.isPending();
  }
}
