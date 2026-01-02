// modules/groupes/entities/message-groupe.entity.ts
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

export enum MessageGroupeType {
  NORMAL = 'normal',
  SYSTEM = 'system',
  ALERT = 'alert',
  ANNONCE = 'annonce',
}

export enum MessageGroupeStatut {
  SENT = 'sent',
  DELETED = 'deleted',
  ARCHIVED = 'archived',
}

@Entity('messages_groupe')
@Index(['groupe_id'])
@Index(['sender_id', 'sender_type'])
@Index(['created_at'])
export class MessageGroupe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  groupe_id: number;

  // Sender polymorphique (User ou Societe)
  @Column({ type: 'int' })
  sender_id: number;

  @Column({ type: 'varchar', length: 100 })
  sender_type: string; // 'User' ou 'Societe'

  @Column({ type: 'text' })
  contenu: string;

  @Column({
    type: 'enum',
    enum: MessageGroupeType,
    default: MessageGroupeType.NORMAL,
  })
  type: MessageGroupeType;

  @Column({
    type: 'enum',
    enum: MessageGroupeStatut,
    default: MessageGroupeStatut.SENT,
  })
  statut: MessageGroupeStatut;

  @Column({ type: 'json', nullable: true })
  fichiers: string[]; // URLs des fichiers uploadés

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: false })
  is_edited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  edited_at: Date;

  // Pour le système de "lu par" (stocke les IDs des membres qui ont lu)
  @Column({ type: 'json', nullable: true })
  read_by: number[]; // Array des user_id qui ont lu le message

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  // Méthodes helper
  isSenderUser(): boolean {
    return this.sender_type === 'User';
  }

  isSenderSociete(): boolean {
    return this.sender_type === 'Societe';
  }

  isMessageNormal(): boolean {
    return this.type === MessageGroupeType.NORMAL;
  }

  isMessageSystem(): boolean {
    return this.type === MessageGroupeType.SYSTEM;
  }

  isMessageAnnonce(): boolean {
    return this.type === MessageGroupeType.ANNONCE;
  }

  isDeleted(): boolean {
    return this.statut === MessageGroupeStatut.DELETED;
  }

  markAsDeleted(): void {
    this.statut = MessageGroupeStatut.DELETED;
  }

  markAsRead(userId: number): void {
    if (!this.read_by) {
      this.read_by = [];
    }
    if (!this.read_by.includes(userId)) {
      this.read_by.push(userId);
    }
  }

  isReadBy(userId: number): boolean {
    return this.read_by ? this.read_by.includes(userId) : false;
  }

  getReadCount(): number {
    return this.read_by ? this.read_by.length : 0;
  }
}
