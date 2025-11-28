// modules/messages/services/conversation.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageCollaborationRepository } from '../repositories/message-collaboration.repository';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepo: Repository<Societe>,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageCollaborationRepository,
  ) {}

  /**
   * Vérifier qu'un participant existe dans la base de données
   */
  private async validateParticipantExists(participantId: number, participantType: string): Promise<void> {
    if (participantType === 'User') {
      const user = await this.userRepo.findOne({ where: { id: participantId } });
      if (!user) {
        throw new BadRequestException(`L'utilisateur avec l'ID ${participantId} n'existe pas`);
      }
    } else if (participantType === 'Societe') {
      const societe = await this.societeRepo.findOne({ where: { id: participantId } });
      if (!societe) {
        throw new BadRequestException(`La société avec l'ID ${participantId} n'existe pas`);
      }
    } else {
      throw new BadRequestException(`Type de participant invalide: ${participantType}`);
    }
  }

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

    // Valider que le participant2 existe
    await this.validateParticipantExists(dto.participant2_id, dto.participant2_type);

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

    conversation.archiveFor(participantId, participantType);
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

    conversation.unarchiveFor(participantId, participantType);
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
