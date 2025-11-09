// modules/notifications/entities/notification.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Types de notifications couvrant toutes les interactions User/Societe
 */
export enum NotificationType {
  // User ↔ User (4 types)
  USER_FOLLOW_REQUEST = 'user_follow_request',
  USER_FOLLOW_ACCEPTED = 'user_follow_accepted',
  USER_STARTED_FOLLOWING = 'user_started_following',
  USER_UNFOLLOWED = 'user_unfollowed',

  // Societe ↔ Societe (3 types)
  SOCIETE_FOLLOW_REQUEST = 'societe_follow_request',
  SOCIETE_FOLLOW_ACCEPTED = 'societe_follow_accepted',
  SOCIETE_STARTED_FOLLOWING = 'societe_started_following',

  // User ↔ Societe (10 types)
  ABONNEMENT_REQUEST_SENT = 'abonnement_request_sent',
  ABONNEMENT_REQUEST_RECEIVED = 'abonnement_request_received',
  ABONNEMENT_ACCEPTED = 'abonnement_accepted',
  ABONNEMENT_DECLINED = 'abonnement_declined',
  ABONNEMENT_EXPIRED = 'abonnement_expired',
  ABONNEMENT_RENEWED = 'abonnement_renewed',
  ABONNEMENT_CANCELLED = 'abonnement_cancelled',
  ABONNEMENT_PLAN_CHANGED = 'abonnement_plan_changed',
  PAGE_PARTENARIAT_UPDATED = 'page_partenariat_updated',
  INFORMATION_PARTENAIRE_ADDED = 'information_partenaire_added',

  // Groupes (7 types)
  GROUPE_INVITATION_RECEIVED = 'groupe_invitation_received',
  GROUPE_INVITATION_ACCEPTED = 'groupe_invitation_accepted',
  GROUPE_INVITATION_DECLINED = 'groupe_invitation_declined',
  GROUPE_MEMBER_JOINED = 'groupe_member_joined',
  GROUPE_MEMBER_LEFT = 'groupe_member_left',
  GROUPE_MEMBER_REMOVED = 'groupe_member_removed',
  GROUPE_UPDATED = 'groupe_updated',

  // Posts (7 types)
  POST_CREATED = 'post_created',
  POST_LIKED = 'post_liked',
  POST_UNLIKED = 'post_unliked',
  POST_COMMENTED = 'post_commented',
  POST_COMMENT_REPLIED = 'post_comment_replied',
  POST_SHARED = 'post_shared',
  POST_DELETED = 'post_deleted',

  // Messages (6 types)
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_READ = 'message_read',
  CONVERSATION_CREATED = 'conversation_created',
  CONVERSATION_ARCHIVED = 'conversation_archived',
  CONVERSATION_UNARCHIVED = 'conversation_unarchived',
  MESSAGE_SYSTEM = 'message_system',

  // Transactions (10 types)
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_PENDING_VALIDATION = 'transaction_pending_validation',
  TRANSACTION_VALIDATED = 'transaction_validated',
  TRANSACTION_REJECTED = 'transaction_rejected',
  TRANSACTION_DELETED = 'transaction_deleted',
  TRANSACTION_COLLABORATION_CREATED = 'transaction_collaboration_created',
  TRANSACTION_COLLABORATION_UPDATED = 'transaction_collaboration_updated',
  TRANSACTION_COLLABORATION_COMPLETED = 'transaction_collaboration_completed',
  TRANSACTION_COLLABORATION_CANCELLED = 'transaction_collaboration_cancelled',
  TRANSACTION_PAYMENT_RECEIVED = 'transaction_payment_received',

  // Système / Mentions (2 types)
  MENTION = 'mention',
  SYSTEM = 'system',
}

/**
 * Notification entity - Support polymorphique pour User et Societe
 *
 * Destinataires possibles:
 * - recipient_type = 'User' → User reçoit la notification
 * - recipient_type = 'Societe' → Societe reçoit la notification
 *
 * Acteurs possibles:
 * - actor_type = 'User' → L'action a été effectuée par un User
 * - actor_type = 'Societe' → L'action a été effectuée par une Societe
 * - actor_type = 'System' → Notification système
 */
@Entity('notifications')
@Index(['recipient_id', 'recipient_type'])
@Index(['is_read'])
@Index(['type'])
@Index(['created_at'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  // Destinataire (polymorphique: User ou Societe)
  @Column({ type: 'int' })
  recipient_id: number;

  @Column({ type: 'varchar', length: 100 })
  recipient_type: string; // 'User' ou 'Societe'

  // Acteur de l'action (polymorphique: User, Societe ou System)
  @Column({ type: 'int', nullable: true })
  actor_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actor_type: string; // 'User', 'Societe', ou 'System'

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  // Données additionnelles (IDs d'entités liées, etc.)
  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  action_url: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Méthodes helper
  markAsRead(): void {
    this.is_read = true;
    this.read_at = new Date();
  }

  isRecent(): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.created_at > oneDayAgo;
  }

  belongsTo(recipientId: number, recipientType: string): boolean {
    return this.recipient_id === recipientId && this.recipient_type === recipientType;
  }

  isFromActor(actorId: number, actorType: string): boolean {
    return this.actor_id === actorId && this.actor_type === actorType;
  }

  isSystemNotification(): boolean {
    return this.actor_type === 'System' || this.type === NotificationType.SYSTEM;
  }
}
