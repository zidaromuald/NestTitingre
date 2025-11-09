// modules/messages/repositories/conversation.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationRepository extends Repository<Conversation> {
  constructor(private dataSource: DataSource) {
    super(Conversation, dataSource.createEntityManager());
  }

  /**
   * Trouver une conversation entre deux participants (dans n'importe quel ordre)
   */
  async findBetweenParticipants(
    participant1Id: number,
    participant1Type: string,
    participant2Id: number,
    participant2Type: string,
  ): Promise<Conversation | null> {
    return this.createQueryBuilder('conversation')
      .where(
        `(conversation.participant1_id = :p1Id AND conversation.participant1_type = :p1Type AND
         conversation.participant2_id = :p2Id AND conversation.participant2_type = :p2Type)`,
        { p1Id: participant1Id, p1Type: participant1Type, p2Id: participant2Id, p2Type: participant2Type },
      )
      .orWhere(
        `(conversation.participant1_id = :p2Id AND conversation.participant1_type = :p2Type AND
         conversation.participant2_id = :p1Id AND conversation.participant2_type = :p1Type)`,
        { p1Id: participant1Id, p1Type: participant1Type, p2Id: participant2Id, p2Type: participant2Type },
      )
      .getOne();
  }

  /**
   * Récupérer toutes les conversations d'un participant
   */
  async findByParticipant(participantId: number, participantType: string): Promise<Conversation[]> {
    return this.createQueryBuilder('conversation')
      .where('conversation.participant1_id = :participantId AND conversation.participant1_type = :participantType', {
        participantId,
        participantType,
      })
      .orWhere('conversation.participant2_id = :participantId AND conversation.participant2_type = :participantType', {
        participantId,
        participantType,
      })
      .andWhere('conversation.is_archived = :isArchived', { isArchived: false })
      .orderBy('conversation.dernier_message_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer les conversations archivées d'un participant
   */
  async findArchivedByParticipant(participantId: number, participantType: string): Promise<Conversation[]> {
    return this.createQueryBuilder('conversation')
      .where('conversation.participant1_id = :participantId AND conversation.participant1_type = :participantType', {
        participantId,
        participantType,
      })
      .orWhere('conversation.participant2_id = :participantId AND conversation.participant2_type = :participantType', {
        participantId,
        participantType,
      })
      .andWhere('conversation.is_archived = :isArchived', { isArchived: true })
      .orderBy('conversation.dernier_message_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer une conversation avec ses messages
   */
  async findByIdWithMessages(id: number): Promise<Conversation | null> {
    return this.findOne({
      where: { id },
      relations: ['messages'],
      order: {
        messages: {
          created_at: 'ASC',
        },
      },
    });
  }

  /**
   * Vérifier si un participant fait partie d'une conversation
   */
  async isParticipant(conversationId: number, participantId: number, participantType: string): Promise<boolean> {
    const count = await this.createQueryBuilder('conversation')
      .where('conversation.id = :conversationId', { conversationId })
      .andWhere(
        `(conversation.participant1_id = :participantId AND conversation.participant1_type = :participantType) OR
         (conversation.participant2_id = :participantId AND conversation.participant2_type = :participantType)`,
        { participantId, participantType },
      )
      .getCount();

    return count > 0;
  }

  /**
   * Compter les conversations non archivées d'un participant
   */
  async countActiveForParticipant(participantId: number, participantType: string): Promise<number> {
    return this.createQueryBuilder('conversation')
      .where('conversation.participant1_id = :participantId AND conversation.participant1_type = :participantType', {
        participantId,
        participantType,
      })
      .orWhere('conversation.participant2_id = :participantId AND conversation.participant2_type = :participantType', {
        participantId,
        participantType,
      })
      .andWhere('conversation.is_archived = :isArchived', { isArchived: false })
      .getCount();
  }
}
