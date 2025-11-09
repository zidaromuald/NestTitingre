// modules/messages/repositories/message-collaboration.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MessageCollaboration, MessageCollaborationStatut, MessageCollaborationType } from '../entities/message-collaboration.entity';

@Injectable()
export class MessageCollaborationRepository extends Repository<MessageCollaboration> {
  constructor(private dataSource: DataSource) {
    super(MessageCollaboration, dataSource.createEntityManager());
  }

  /**
   * Récupérer tous les messages d'une conversation
   */
  async findByConversationId(conversationId: number): Promise<MessageCollaboration[]> {
    return this.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Récupérer les messages non lus d'un destinataire dans une conversation
   */
  async findUnreadByRecipient(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<MessageCollaboration[]> {
    return this.createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.recipient_id = :recipientId', { recipientId })
      .andWhere('message.recipient_type = :recipientType', { recipientType })
      .andWhere('message.statut != :statut', { statut: MessageCollaborationStatut.READ })
      .orderBy('message.created_at', 'ASC')
      .getMany();
  }

  /**
   * Compter les messages non lus d'un destinataire dans une conversation
   */
  async countUnreadByRecipient(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<number> {
    return this.createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.recipient_id = :recipientId', { recipientId })
      .andWhere('message.recipient_type = :recipientType', { recipientType })
      .andWhere('message.statut != :statut', { statut: MessageCollaborationStatut.READ })
      .getCount();
  }

  /**
   * Compter le total de messages non lus pour un destinataire (toutes conversations)
   */
  async countTotalUnreadByRecipient(recipientId: number, recipientType: string): Promise<number> {
    return this.createQueryBuilder('message')
      .where('message.recipient_id = :recipientId', { recipientId })
      .andWhere('message.recipient_type = :recipientType', { recipientType })
      .andWhere('message.statut != :statut', { statut: MessageCollaborationStatut.READ })
      .getCount();
  }

  /**
   * Récupérer le dernier message d'une conversation
   */
  async findLastByConversationId(conversationId: number): Promise<MessageCollaboration | null> {
    return this.findOne({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Récupérer les messages liés à une transaction
   */
  async findByTransactionId(transactionId: number): Promise<MessageCollaboration[]> {
    return this.find({
      where: { transaction_collaboration_id: transactionId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Récupérer les messages liés à un abonnement
   */
  async findByAbonnementId(abonnementId: number): Promise<MessageCollaboration[]> {
    return this.find({
      where: { abonnement_id: abonnementId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Récupérer les messages système d'une conversation
   */
  async findSystemMessagesByConversationId(conversationId: number): Promise<MessageCollaboration[]> {
    return this.find({
      where: { conversation_id: conversationId, type: MessageCollaborationType.SYSTEM },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Marquer tous les messages d'une conversation comme lus par un destinataire
   */
  async markAllAsReadByRecipient(
    conversationId: number,
    recipientId: number,
    recipientType: string,
  ): Promise<void> {
    await this.createQueryBuilder()
      .update(MessageCollaboration)
      .set({ statut: MessageCollaborationStatut.READ, lu_a: new Date() })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('recipient_id = :recipientId', { recipientId })
      .andWhere('recipient_type = :recipientType', { recipientType })
      .andWhere('statut != :statut', { statut: MessageCollaborationStatut.READ })
      .execute();
  }

  /**
   * Récupérer un message avec ses relations (conversation, transaction, abonnement)
   */
  async findByIdWithRelations(id: number): Promise<MessageCollaboration | null> {
    return this.findOne({
      where: { id },
      relations: ['conversation', 'transactionCollaboration', 'abonnement'],
    });
  }
}
