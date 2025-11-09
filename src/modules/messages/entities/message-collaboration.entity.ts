// modules/messages/entities/message-collaboration.entity.ts
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
import { Conversation } from './conversation.entity';
import { TransactionCollaboration } from '../../transactions/entities/transaction-collaboration.entity';
import { Abonnement } from '../../suivis/entities/abonnement.entity';

export enum MessageCollaborationType {
  NORMAL = 'normal',
  SYSTEM = 'system',
  ALERT = 'alert',
}

export enum MessageCollaborationStatut {
  SENT = 'sent',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Entity('message_collaborations')
@Index(['conversation_id'])
@Index(['transaction_collaboration_id'])
@Index(['sender_id', 'sender_type'])
@Index(['recipient_id', 'recipient_type'])
@Index(['statut'])
export class MessageCollaboration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  conversation_id: number;

  @Column({ type: 'int', nullable: true })
  transaction_collaboration_id: number;

  @Column({ type: 'int', nullable: true })
  abonnement_id: number;

  // Sender polymorphique (User ou Societe)
  @Column({ type: 'int' })
  sender_id: number;

  @Column({ type: 'varchar', length: 100 })
  sender_type: string;

  // Recipient polymorphique (User ou Societe)
  @Column({ type: 'int' })
  recipient_id: number;

  @Column({ type: 'varchar', length: 100 })
  recipient_type: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({
    type: 'enum',
    enum: MessageCollaborationType,
    enumName: 'message_collaboration_type',
    name: 'type',
    default: MessageCollaborationType.NORMAL,
  })
  type: MessageCollaborationType;

  @Column({
    type: 'enum',
    enum: MessageCollaborationStatut,
    enumName: 'message_collaboration_statut',
    name: 'statut',
    default: MessageCollaborationStatut.SENT,
  })
  statut: MessageCollaborationStatut;

  @Column({ type: 'timestamp', nullable: true })
  lu_a: Date;

  @Column({ type: 'json', nullable: true })
  fichiers: string[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    nullable: true,
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => TransactionCollaboration, { nullable: true })
  @JoinColumn({ name: 'transaction_collaboration_id' })
  transactionCollaboration: TransactionCollaboration;

  @ManyToOne(() => Abonnement, (abonnement) => abonnement.messages, {
    nullable: true,
  })
  @JoinColumn({ name: 'abonnement_id' })
  abonnement: Abonnement;

  // Méthodes helper
  markAsRead(): void {
    this.statut = MessageCollaborationStatut.READ;
    this.lu_a = new Date();
  }

  isRead(): boolean {
    return this.statut === MessageCollaborationStatut.READ;
  }

  markAsArchived(): void {
    this.statut = MessageCollaborationStatut.ARCHIVED;
  }

  isArchived(): boolean {
    return this.statut === MessageCollaborationStatut.ARCHIVED;
  }

  isSenderUser(): boolean {
    return this.sender_type === 'User';
  }

  isSenderSociete(): boolean {
    return this.sender_type === 'Societe';
  }

  isRecipientUser(): boolean {
    return this.recipient_type === 'User';
  }

  isRecipientSociete(): boolean {
    return this.recipient_type === 'Societe';
  }

  isMessageNormal(): boolean {
    return this.type === MessageCollaborationType.NORMAL;
  }

  isMessageSystem(): boolean {
    return this.type === MessageCollaborationType.SYSTEM;
  }

  isMessageAlert(): boolean {
    return this.type === MessageCollaborationType.ALERT;
  }
}
