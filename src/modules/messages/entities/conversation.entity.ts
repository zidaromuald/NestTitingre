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

  @Column({ type: 'timestamp', nullable: true })
  dernier_message_at: Date;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

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
}
