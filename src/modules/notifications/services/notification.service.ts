// modules/notifications/services/notification.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';

export interface CreateNotificationDto {
  recipient_id: number;
  recipient_type: string;
  actor_id?: number;
  actor_type?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {}

  /**
   * Créer une nouvelle notification
   * Vérifie les préférences avant de créer
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification | null> {
    // Vérifier si le destinataire a activé ce type de notification
    const isEnabled = await this.notificationPreferenceRepository.isEnabled(
      dto.recipient_id,
      dto.recipient_type,
      dto.type,
    );

    if (!isEnabled) {
      return null; // Ne pas créer la notification si désactivée
    }

    // Vérifier si une notification identique existe déjà (éviter doublons)
    if (dto.actor_id && dto.actor_type) {
      const exists = await this.notificationRepository.notificationExists(
        dto.recipient_id,
        dto.recipient_type,
        dto.type,
        dto.actor_id,
        dto.actor_type,
      );

      if (exists) {
        return null; // Ne pas créer de doublon
      }
    }

    const notification = this.notificationRepo.create({
      recipient_id: dto.recipient_id,
      recipient_type: dto.recipient_type,
      actor_id: dto.actor_id,
      actor_type: dto.actor_type,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data,
      action_url: dto.action_url,
    });

    return this.notificationRepo.save(notification);
  }

  /**
   * Récupérer toutes les notifications d'un destinataire
   */
  async getNotifications(recipientId: number, recipientType: string): Promise<Notification[]> {
    return this.notificationRepository.findByRecipient(recipientId, recipientType);
  }

  /**
   * Récupérer les notifications non lues
   */
  async getUnreadNotifications(recipientId: number, recipientType: string): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByRecipient(recipientId, recipientType);
  }

  /**
   * Compter les notifications non lues
   */
  async countUnread(recipientId: number, recipientType: string): Promise<number> {
    return this.notificationRepository.countUnreadByRecipient(recipientId, recipientType);
  }

  /**
   * Récupérer les notifications récentes (24h)
   */
  async getRecentNotifications(recipientId: number, recipientType: string): Promise<Notification[]> {
    return this.notificationRepository.findRecentByRecipient(recipientId, recipientType);
  }

  /**
   * Récupérer les notifications paginées
   */
  async getPaginatedNotifications(
    recipientId: number,
    recipientType: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    const { notifications, total } = await this.notificationRepository.findPaginated(
      recipientId,
      recipientType,
      page,
      limit,
    );

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: number, recipientId: number, recipientType: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id: notificationId } });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (!notification.belongsTo(recipientId, recipientType)) {
      throw new NotFoundException('Notification introuvable');
    }

    if (!notification.is_read) {
      notification.markAsRead();
      return this.notificationRepo.save(notification);
    }

    return notification;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(recipientId: number, recipientType: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(recipientId, recipientType);
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: number, recipientId: number, recipientType: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({ where: { id: notificationId } });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (!notification.belongsTo(recipientId, recipientType)) {
      throw new NotFoundException('Notification introuvable');
    }

    await this.notificationRepo.remove(notification);
  }

  /**
   * Supprimer toutes les notifications lues
   */
  async deleteReadNotifications(recipientId: number, recipientType: string): Promise<number> {
    return this.notificationRepository.deleteReadByRecipient(recipientId, recipientType);
  }

  /**
   * Nettoyer les anciennes notifications (cron job)
   */
  async cleanupOldNotifications(days: number = 90): Promise<number> {
    return this.notificationRepository.deleteOlderThan(days);
  }

  // ========== MÉTHODES POUR CRÉER DES NOTIFICATIONS SPÉCIFIQUES ==========

  /**
   * Notification: User suit un autre User
   */
  async notifyUserStartedFollowing(followedUserId: number, followerId: number): Promise<void> {
    await this.createNotification({
      recipient_id: followedUserId,
      recipient_type: 'User',
      actor_id: followerId,
      actor_type: 'User',
      type: NotificationType.USER_STARTED_FOLLOWING,
      title: 'Nouveau follower',
      message: 'Un utilisateur vous suit maintenant',
      action_url: `/users/${followerId}`,
    });
  }

  /**
   * Notification: Societe suit une autre Societe
   */
  async notifySocieteStartedFollowing(followedSocieteId: number, followerSocieteId: number): Promise<void> {
    await this.createNotification({
      recipient_id: followedSocieteId,
      recipient_type: 'Societe',
      actor_id: followerSocieteId,
      actor_type: 'Societe',
      type: NotificationType.SOCIETE_STARTED_FOLLOWING,
      title: 'Nouvelle société abonnée',
      message: 'Une société vous suit maintenant',
      action_url: `/societes/${followerSocieteId}`,
    });
  }

  /**
   * Notification: Demande d'abonnement reçue
   */
  async notifyAbonnementRequestReceived(societeId: number, userId: number): Promise<void> {
    await this.createNotification({
      recipient_id: societeId,
      recipient_type: 'Societe',
      actor_id: userId,
      actor_type: 'User',
      type: NotificationType.ABONNEMENT_REQUEST_RECEIVED,
      title: 'Nouvelle demande d\'abonnement',
      message: 'Un utilisateur souhaite s\'abonner à vos services',
      action_url: `/abonnements/demandes`,
    });
  }

  /**
   * Notification: Abonnement accepté
   */
  async notifyAbonnementAccepted(userId: number, societeId: number, abonnementId: number): Promise<void> {
    await this.createNotification({
      recipient_id: userId,
      recipient_type: 'User',
      actor_id: societeId,
      actor_type: 'Societe',
      type: NotificationType.ABONNEMENT_ACCEPTED,
      title: 'Abonnement accepté',
      message: 'Votre demande d\'abonnement a été acceptée',
      action_url: `/abonnements/${abonnementId}`,
      data: { abonnement_id: abonnementId },
    });
  }

  /**
   * Notification: Transaction en attente de validation
   */
  async notifyTransactionPendingValidation(
    userId: number,
    societeId: number,
    transactionId: number,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: userId,
      recipient_type: 'User',
      actor_id: societeId,
      actor_type: 'Societe',
      type: NotificationType.TRANSACTION_PENDING_VALIDATION,
      title: 'Transaction à valider',
      message: 'Une nouvelle transaction nécessite votre validation',
      action_url: `/transactions/${transactionId}`,
      data: { transaction_id: transactionId },
    });
  }

  /**
   * Notification: Transaction validée
   */
  async notifyTransactionValidated(societeId: number, userId: number, transactionId: number): Promise<void> {
    await this.createNotification({
      recipient_id: societeId,
      recipient_type: 'Societe',
      actor_id: userId,
      actor_type: 'User',
      type: NotificationType.TRANSACTION_VALIDATED,
      title: 'Transaction validée',
      message: 'Une transaction a été validée par l\'utilisateur',
      action_url: `/transactions/${transactionId}`,
      data: { transaction_id: transactionId },
    });
  }

  /**
   * Notification: Nouveau message reçu
   */
  async notifyMessageReceived(
    recipientId: number,
    recipientType: string,
    senderId: number,
    senderType: string,
    conversationId: number,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: recipientId,
      recipient_type: recipientType,
      actor_id: senderId,
      actor_type: senderType,
      type: NotificationType.MESSAGE_RECEIVED,
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message',
      action_url: `/conversations/${conversationId}`,
      data: { conversation_id: conversationId },
    });
  }

  /**
   * Notification: Invitation à un groupe
   */
  async notifyGroupeInvitation(
    recipientId: number,
    recipientType: string,
    inviterId: number,
    inviterType: string,
    groupeId: number,
    groupeName: string,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: recipientId,
      recipient_type: recipientType,
      actor_id: inviterId,
      actor_type: inviterType,
      type: NotificationType.GROUPE_INVITATION_RECEIVED,
      title: 'Invitation à un groupe',
      message: `Vous avez été invité à rejoindre le groupe "${groupeName}"`,
      action_url: `/groupes/${groupeId}`,
      data: { groupe_id: groupeId },
    });
  }

  /**
   * Notification: Post liké
   */
  async notifyPostLiked(
    postOwnerId: number,
    postOwnerType: string,
    likerId: number,
    likerType: string,
    postId: number,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: postOwnerId,
      recipient_type: postOwnerType,
      actor_id: likerId,
      actor_type: likerType,
      type: NotificationType.POST_LIKED,
      title: 'Nouveau like',
      message: 'Quelqu\'un a aimé votre publication',
      action_url: `/posts/${postId}`,
      data: { post_id: postId },
    });
  }

  /**
   * Notification: Commentaire sur un post
   */
  async notifyPostCommented(
    postOwnerId: number,
    postOwnerType: string,
    commenterId: number,
    commenterType: string,
    postId: number,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: postOwnerId,
      recipient_type: postOwnerType,
      actor_id: commenterId,
      actor_type: commenterType,
      type: NotificationType.POST_COMMENTED,
      title: 'Nouveau commentaire',
      message: 'Quelqu\'un a commenté votre publication',
      action_url: `/posts/${postId}`,
      data: { post_id: postId },
    });
  }

  /**
   * Notification: Mention dans un post ou commentaire
   */
  async notifyMention(
    mentionedId: number,
    mentionedType: string,
    mentionerId: number,
    mentionerType: string,
    contextUrl: string,
  ): Promise<void> {
    await this.createNotification({
      recipient_id: mentionedId,
      recipient_type: mentionedType,
      actor_id: mentionerId,
      actor_type: mentionerType,
      type: NotificationType.MENTION,
      title: 'Vous avez été mentionné',
      message: 'Quelqu\'un vous a mentionné',
      action_url: contextUrl,
    });
  }

  /**
   * Notification système
   */
  async notifySystem(recipientId: number, recipientType: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      recipient_id: recipientId,
      recipient_type: recipientType,
      actor_type: 'System',
      type: NotificationType.SYSTEM,
      title,
      message,
    });
  }
}
