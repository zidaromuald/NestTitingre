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
@Index(['groupe_id', 'invited_user_id'])
@Index(['status']) // Propriété TypeScript (colonne 'statut' en base)
export class GroupeInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  groupe_id: number;

  @Column({ type: 'int' })
  invited_user_id: number;

  @Column({ type: 'int' })
  invited_by_user_id: number;

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
  responded_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe, (groupe) => groupe.invitations)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => User, (user) => user.invitationsRecues)
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser: User;

  @ManyToOne(() => User, (user) => user.invitationsEnvoyees)
  @JoinColumn({ name: 'invited_by_user_id' })
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
