// modules/messages/entities/conversation.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MessageCollaboration } from './message-collaboration.entity';

@Entity('conversations')
@Index(['participant1_id', 'participant1_type'])
@Index(['participant2_id', 'participant2_type'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  // Participant 1 (polymorphique: User ou Societe)
  @Column({ type: 'int' })
  participant1_id: number;

  @Column({ type: 'varchar', length: 100 })
  participant1_type: string;

  // Participant 2 (polymorphique: User ou Societe)
  @Column({ type: 'int' })
  participant2_id: number;

  @Column({ type: 'varchar', length: 100 })
  participant2_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  titre: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_message_at' })
  dernier_message_at: Date;

  @Column({ type: 'boolean', default: false, name: 'participant1_archived' })
  participant1_archived: boolean;

  @Column({ type: 'boolean', default: false, name: 'participant2_archived' })
  participant2_archived: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => MessageCollaboration, (message) => message.conversation)
  messages: MessageCollaboration[];

  // Méthodes helper
  isParticipant(entityId: number, entityType: string): boolean {
    return (
      (this.participant1_id === entityId &&
        this.participant1_type === entityType) ||
      (this.participant2_id === entityId &&
        this.participant2_type === entityType)
    );
  }

  getOtherParticipant(
    entityId: number,
    entityType: string,
  ): { id: number; type: string } | null {
    if (
      this.participant1_id === entityId &&
      this.participant1_type === entityType
    ) {
      return {
        id: this.participant2_id,
        type: this.participant2_type,
      };
    }

    if (
      this.participant2_id === entityId &&
      this.participant2_type === entityType
    ) {
      return {
        id: this.participant1_id,
        type: this.participant1_type,
      };
    }

    return null;
  }

  isArchivedFor(entityId: number, entityType: string): boolean {
    if (
      this.participant1_id === entityId &&
      this.participant1_type === entityType
    ) {
      return this.participant1_archived;
    }

    if (
      this.participant2_id === entityId &&
      this.participant2_type === entityType
    ) {
      return this.participant2_archived;
    }

    return false;
  }

  archiveFor(entityId: number, entityType: string): void {
    if (
      this.participant1_id === entityId &&
      this.participant1_type === entityType
    ) {
      this.participant1_archived = true;
    }

    if (
      this.participant2_id === entityId &&
      this.participant2_type === entityType
    ) {
      this.participant2_archived = true;
    }
  }

  unarchiveFor(entityId: number, entityType: string): void {
    if (
      this.participant1_id === entityId &&
      this.participant1_type === entityType
    ) {
      this.participant1_archived = false;
    }

    if (
      this.participant2_id === entityId &&
      this.participant2_type === entityType
    ) {
      this.participant2_archived = false;
    }
  }
}
