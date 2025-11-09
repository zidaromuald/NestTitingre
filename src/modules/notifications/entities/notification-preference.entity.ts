// modules/notifications/entities/notification-preference.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationType } from './notification.entity';

/**
 * NotificationPreference - Préférences de notifications pour Users et Societes
 *
 * Permet à chaque User ou Societe de contrôler quelles notifications ils souhaitent recevoir.
 * Par défaut, toutes les notifications sont activées.
 */
@Entity('notification_preferences')
@Index(['owner_id', 'owner_type', 'notification_type'], { unique: true })
@Index(['owner_id', 'owner_type'])
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  // Propriétaire de la préférence (polymorphique: User ou Societe)
  @Column({ type: 'int' })
  owner_id: number;

  @Column({ type: 'varchar', length: 100 })
  owner_type: string; // 'User' ou 'Societe'

  // Type de notification concerné
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notification_type: NotificationType;

  // Si true, le user/societe recevra ce type de notification
  @Column({ type: 'boolean', default: true })
  is_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Méthodes helper
  belongsTo(ownerId: number, ownerType: string): boolean {
    return this.owner_id === ownerId && this.owner_type === ownerType;
  }

  toggle(): void {
    this.is_enabled = !this.is_enabled;
  }

  enable(): void {
    this.is_enabled = true;
  }

  disable(): void {
    this.is_enabled = false;
  }
}
