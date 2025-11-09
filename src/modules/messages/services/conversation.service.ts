// modules/messages/services/conversation.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageCollaborationRepository } from '../repositories/message-collaboration.repository';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageCollaborationRepository,
  ) {}

  /**
   * Créer ou récupérer une conversation existante entre deux participants
   */
  async createOrGetConversation(
    participant1Id: number,
    participant1Type: string,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    // Vérifier si conversation existe déjà
    const existing = await this.conversationRepository.findBetweenParticipants(
      participant1Id,
      participant1Type,
      dto.participant2_id,
      dto.participant2_type,
    );

    if (existing) {
      return existing;
    }

    // Créer nouvelle conversation
    const conversation = this.conversationRepo.create({
      participant1_id: participant1Id,
      participant1_type: participant1Type,
      participant2_id: dto.participant2_id,
      participant2_type: dto.participant2_type,
      titre: dto.titre,
      metadata: dto.metadata,
    });

    return this.conversationRepo.save(conversation);
  }

  /**
   * Récupérer toutes les conversations d'un participant
   */
  async getConversationsForParticipant(
    participantId: number,
    participantType: string,
  ): Promise<{ conversation: Conversation; unreadCount: number }[]> {
    const conversations = await this.conversationRepository.findByParticipant(participantId, participantType);

    // Pour chaque conversation, compter les messages non lus
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await this.messageRepository.countUnreadByRecipient(
          conversation.id,
          participantId,
          participantType,
        );
        return { conversation, unreadCount };
      }),
    );

    return conversationsWithUnread;
  }

  /**
   * Récupérer les conversations archivées d'un participant
   */
  async getArchivedConversations(participantId: number, participantType: string): Promise<Conversation[]> {
    return this.conversationRepository.findArchivedByParticipant(participantId, participantType);
  }

  /**
   * Récupérer une conversation par ID
   */
  async getConversationById(
    id: number,
    participantId: number,
    participantType: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({ where: { id } });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const isParticipant = await this.conversationRepository.isParticipant(id, participantId, participantType);

    if (!isParticipant) {
      throw new ForbiddenException('Vous ne faites pas partie de cette conversation');
    }

    return conversation;
  }

  /**
   * Archiver une conversation
   */
  async archiveConversation(
    id: number,
    participantId: number,
    participantType: string,
  ): Promise<Conversation> {
    const conversation = await this.getConversationById(id, participantId, participantType);

    conversation.is_archived = true;
    return this.conversationRepo.save(conversation);
  }

  /**
   * Désarchiver une conversation
   */
  async unarchiveConversation(
    id: number,
    participantId: number,
    participantType: string,
  ): Promise<Conversation> {
    const conversation = await this.getConversationById(id, participantId, participantType);

    conversation.is_archived = false;
    return this.conversationRepo.save(conversation);
  }

  /**
   * Compter le total de conversations actives
   */
  async countActiveConversations(participantId: number, participantType: string): Promise<number> {
    return this.conversationRepository.countActiveForParticipant(participantId, participantType);
  }

  /**
   * Mettre à jour le timestamp du dernier message
   */
  async updateLastMessageTimestamp(conversationId: number): Promise<void> {
    await this.conversationRepo.update(conversationId, {
      dernier_message_at: new Date(),
    });
  }
}
