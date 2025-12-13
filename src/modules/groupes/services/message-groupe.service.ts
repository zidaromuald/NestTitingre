// modules/groupes/services/message-groupe.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageGroupe, MessageGroupeType, MessageGroupeStatut } from '../entities/message-groupe.entity';
import { MessageGroupeRepository } from '../repositories/message-groupe.repository';
import { GroupeRepository } from '../repositories/groupe.repository';
import { SendGroupMessageDto } from '../dto/send-group-message.dto';
import { UpdateGroupMessageDto } from '../dto/update-group-message.dto';

@Injectable()
export class MessageGroupeService {
  constructor(
    @InjectRepository(MessageGroupe)
    private readonly messageRepo: Repository<MessageGroupe>,
    private readonly messageGroupeRepository: MessageGroupeRepository,
    private readonly groupeRepository: GroupeRepository,
  ) {}

  /**
   * Envoyer un message dans un groupe
   */
  async sendMessage(
    groupeId: number,
    senderId: number,
    senderType: string,
    dto: SendGroupMessageDto,
  ): Promise<MessageGroupe> {
    // Vérifier que le groupe existe
    const groupe = await this.groupeRepository.findById(groupeId);
    if (!groupe) {
      throw new NotFoundException('Groupe introuvable');
    }

    // Vérifier que l'utilisateur est membre du groupe
    if (senderType === 'User') {
      const isMember = await this.groupeRepository.isUserMembre(groupeId, senderId);
      if (!isMember) {
        throw new ForbiddenException('Vous devez être membre du groupe pour envoyer un message');
      }
    }

    // Créer le message
    const message = this.messageRepo.create({
      groupe_id: groupeId,
      sender_id: senderId,
      sender_type: senderType,
      contenu: dto.contenu,
      type: dto.type || MessageGroupeType.NORMAL,
      statut: MessageGroupeStatut.SENT,
      fichiers: dto.fichiers || [],
      metadata: dto.metadata,
      read_by: [senderId], // L'expéditeur a automatiquement lu son propre message
    });

    return this.messageRepo.save(message);
  }

  /**
   * Récupérer les messages d'un groupe
   */
  async getMessagesByGroupe(
    groupeId: number,
    userId: number,
    limit = 100,
    offset = 0,
  ): Promise<MessageGroupe[]> {
    // Vérifier que le groupe existe
    const groupe = await this.groupeRepository.findById(groupeId);
    if (!groupe) {
      throw new NotFoundException('Groupe introuvable');
    }

    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe pour voir les messages');
    }

    return this.messageGroupeRepository.findByGroupeId(groupeId, limit, offset);
  }

  /**
   * Récupérer les messages non lus d'un groupe pour un utilisateur
   */
  async getUnreadMessages(groupeId: number, userId: number): Promise<MessageGroupe[]> {
    // Vérifier que le groupe existe et que l'utilisateur est membre
    const groupe = await this.groupeRepository.findById(groupeId);
    if (!groupe) {
      throw new NotFoundException('Groupe introuvable');
    }

    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe');
    }

    return this.messageGroupeRepository.findUnreadByUserInGroupe(groupeId, userId);
  }

  /**
   * Compter les messages non lus d'un groupe pour un utilisateur
   */
  async countUnreadMessages(groupeId: number, userId: number): Promise<number> {
    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      return 0;
    }

    return this.messageGroupeRepository.countUnreadByUserInGroupe(groupeId, userId);
  }

  /**
   * Marquer un message comme lu
   */
  async markMessageAsRead(
    messageId: number,
    userId: number,
  ): Promise<MessageGroupe> {
    const message = await this.messageGroupeRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await this.groupeRepository.isUserMembre(message.groupe_id, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe');
    }

    // Marquer comme lu
    message.markAsRead(userId);
    return this.messageRepo.save(message);
  }

  /**
   * Marquer tous les messages d'un groupe comme lus
   */
  async markAllMessagesAsRead(groupeId: number, userId: number): Promise<void> {
    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe');
    }

    await this.messageGroupeRepository.markAllAsReadByUser(groupeId, userId);
  }

  /**
   * Modifier un message
   */
  async updateMessage(
    messageId: number,
    userId: number,
    dto: UpdateGroupMessageDto,
  ): Promise<MessageGroupe> {
    const message = await this.messageGroupeRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Vérifier que c'est bien l'auteur du message
    if (message.sender_id !== userId || message.sender_type !== 'User') {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres messages');
    }

    // Vérifier que le message n'est pas supprimé
    if (message.statut === MessageGroupeStatut.DELETED) {
      throw new BadRequestException('Impossible de modifier un message supprimé');
    }

    // Mettre à jour le message
    if (dto.contenu) {
      message.contenu = dto.contenu;
    }
    if (dto.fichiers) {
      message.fichiers = dto.fichiers;
    }

    message.is_edited = true;
    message.edited_at = new Date();

    return this.messageRepo.save(message);
  }

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.messageGroupeRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Vérifier que c'est bien l'auteur du message
    if (message.sender_id !== userId || message.sender_type !== 'User') {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }

    await this.messageGroupeRepository.softDelete(messageId);
  }

  /**
   * Épingler un message (admin/modérateur uniquement)
   */
  async pinMessage(messageId: number, userId: number): Promise<MessageGroupe> {
    const message = await this.messageGroupeRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Vérifier que l'utilisateur est admin ou modérateur du groupe
    const role = await this.groupeRepository.getMembreRole(message.groupe_id, userId);
    if (role !== 'admin' && role !== 'moderateur') {
      throw new ForbiddenException('Seuls les admins et modérateurs peuvent épingler des messages');
    }

    message.is_pinned = !message.is_pinned;
    return this.messageRepo.save(message);
  }

  /**
   * Récupérer les messages épinglés d'un groupe
   */
  async getPinnedMessages(groupeId: number, userId: number): Promise<MessageGroupe[]> {
    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe');
    }

    return this.messageGroupeRepository.findPinnedByGroupeId(groupeId);
  }

  /**
   * Récupérer les statistiques de messages d'un groupe
   */
  async getMessagesStats(groupeId: number, userId: number) {
    // Vérifier que l'utilisateur est membre du groupe
    const isMember = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (!isMember) {
      throw new ForbiddenException('Vous devez être membre du groupe');
    }

    const stats = await this.messageGroupeRepository.getGroupeMessagesStats(groupeId);
    const unreadCount = await this.countUnreadMessages(groupeId, userId);

    return {
      ...stats,
      unread: unreadCount,
    };
  }

  /**
   * Créer un message système (annonces, notifications)
   */
  async createSystemMessage(
    groupeId: number,
    contenu: string,
    type: MessageGroupeType = MessageGroupeType.SYSTEM,
    metadata?: Record<string, any>,
  ): Promise<MessageGroupe> {
    const message = this.messageRepo.create({
      groupe_id: groupeId,
      sender_id: 0,
      sender_type: 'System',
      contenu,
      type,
      statut: MessageGroupeStatut.SENT,
      fichiers: [],
      metadata,
      read_by: [],
    });

    return this.messageRepo.save(message);
  }
}
