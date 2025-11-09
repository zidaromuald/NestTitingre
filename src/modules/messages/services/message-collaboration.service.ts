// modules/messages/services/message-collaboration.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageCollaboration, MessageCollaborationStatut, MessageCollaborationType } from '../entities/message-collaboration.entity';
import { Conversation } from '../entities/conversation.entity';
import { MessageCollaborationRepository } from '../repositories/message-collaboration.repository';
import { ConversationService } from './conversation.service';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class MessageCollaborationService {
  constructor(
    @InjectRepository(MessageCollaboration)
    private readonly messageRepo: Repository<MessageCollaboration>,
    private readonly messageCollaborationRepository: MessageCollaborationRepository,
    private readonly conversationService: ConversationService,
  ) {}

  /**
   * Envoyer un message dans une conversation
   */
  async sendMessage(
    conversationId: number,
    senderId: number,
    senderType: string,
    dto: SendMessageDto,
  ): Promise<MessageCollaboration> {
    // Vérifier que la conversation existe et que l'utilisateur en fait partie
    const conversation = await this.conversationService.getConversationById(conversationId, senderId, senderType);

    // Déterminer le destinataire (l'autre participant)
    const recipientId =
      conversation.participant1_id === senderId && conversation.participant1_type === senderType
        ? conversation.participant2_id
        : conversation.participant1_id;

    const recipientType =
      conversation.participant1_id === senderId && conversation.participant1_type === senderType
        ? conversation.participant2_type
        : conversation.participant1_type;

    // Créer le message
    const message = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      recipient_id: recipientId,
      recipient_type: recipientType,
      contenu: dto.contenu,
      type: dto.type || MessageCollaborationType.NORMAL,
      statut: MessageCollaborationStatut.SENT,
      fichiers: dto.fichiers || [],
      transaction_collaboration_id: dto.transaction_collaboration_id,
      abonnement_id: dto.abonnement_id,
      metadata: dto.metadata,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Mettre à jour le timestamp de la conversation
    await this.conversationService.updateLastMessageTimestamp(conversationId);

    return savedMessage;
  }

  /**
   * Récupérer tous les messages d'une conversation
   */
  async getMessagesByConversation(
    conversationId: number,
    participantId: number,
    participantType: string,
  ): Promise<MessageCollaboration[]> {
    // Vérifier que l'utilisateur fait partie de la conversation
    await this.conversationService.getConversationById(conversationId, participantId, participantType);

    return this.messageCollaborationRepository.findByConversationId(conversationId);
  }

  /**
   * Marquer un message comme lu
   */
  async markMessageAsRead(
    messageId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<MessageCollaboration> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Vérifier que c'est bien le destinataire
    if (message.recipient_id !== recipientId || message.recipient_type !== recipientType) {
      throw new ForbiddenException('Vous ne pouvez marquer comme lu que vos propres messages');
    }

    // Marquer comme lu si pas déjà lu
    if (message.statut !== MessageCollaborationStatut.READ) {
      message.statut = MessageCollaborationStatut.READ;
      message.lu_a = new Date();
      return this.messageRepo.save(message);
    }

    return message;
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   */
  async markAllMessagesAsRead(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<void> {
    // Vérifier que l'utilisateur fait partie de la conversation
    await this.conversationService.getConversationById(conversationId, recipientId, recipientType);

    await this.messageCollaborationRepository.markAllAsReadByRecipient(conversationId, recipientId, recipientType);
  }

  /**
   * Compter les messages non lus pour un destinataire (toutes conversations)
   */
  async countTotalUnread(recipientId: number, recipientType: string): Promise<number> {
    return this.messageCollaborationRepository.countTotalUnreadByRecipient(recipientId, recipientType);
  }

  /**
   * Compter les messages non lus dans une conversation
   */
  async countUnreadInConversation(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<number> {
    return this.messageCollaborationRepository.countUnreadByRecipient(conversationId, recipientId, recipientType);
  }

  /**
   * Récupérer les messages non lus d'une conversation
   */
  async getUnreadMessages(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<MessageCollaboration[]> {
    // Vérifier que l'utilisateur fait partie de la conversation
    await this.conversationService.getConversationById(conversationId, recipientId, recipientType);

    return this.messageCollaborationRepository.findUnreadByRecipient(conversationId, recipientId, recipientType);
  }

  /**
   * Récupérer les messages liés à une transaction
   */
  async getMessagesByTransaction(transactionId: number): Promise<MessageCollaboration[]> {
    return this.messageCollaborationRepository.findByTransactionId(transactionId);
  }

  /**
   * Récupérer les messages liés à un abonnement
   */
  async getMessagesByAbonnement(abonnementId: number): Promise<MessageCollaboration[]> {
    return this.messageCollaborationRepository.findByAbonnementId(abonnementId);
  }

  /**
   * Créer un message système automatique
   */
  async createSystemMessage(
    conversationId: number,
    contenu: string,
    metadata?: Record<string, any>,
  ): Promise<MessageCollaboration> {
    // Récupérer la conversation directement sans vérification de participant
    const conversation = await this.messageRepo.manager.findOne(Conversation, {
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    const message = this.messageRepo.create({
      conversation_id: conversationId,
      sender_id: 0,
      sender_type: 'System',
      recipient_id: conversation.participant2_id,
      recipient_type: conversation.participant2_type,
      contenu,
      type: MessageCollaborationType.SYSTEM,
      statut: MessageCollaborationStatut.SENT,
      fichiers: [],
      metadata,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Mettre à jour le timestamp de la conversation
    await this.conversationService.updateLastMessageTimestamp(conversationId);

    return savedMessage;
  }
}
