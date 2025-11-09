// modules/notifications/repositories/notification.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  /**
   * Récupérer toutes les notifications d'un destinataire
   */
  async findByRecipient(recipientId: number, recipientType: string): Promise<Notification[]> {
    return this.find({
      where: {
        recipient_id: recipientId,
        recipient_type: recipientType,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer les notifications non lues d'un destinataire
   */
  async findUnreadByRecipient(recipientId: number, recipientType: string): Promise<Notification[]> {
    return this.find({
      where: {
        recipient_id: recipientId,
        recipient_type: recipientType,
        is_read: false,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Compter les notifications non lues d'un destinataire
   */
  async countUnreadByRecipient(recipientId: number, recipientType: string): Promise<number> {
    return this.count({
      where: {
        recipient_id: recipientId,
        recipient_type: recipientType,
        is_read: false,
      },
    });
  }

  /**
   * Récupérer les notifications récentes (dernières 24h)
   */
  async findRecentByRecipient(recipientId: number, recipientType: string): Promise<Notification[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return this.createQueryBuilder('notification')
      .where('notification.recipient_id = :recipientId', { recipientId })
      .andWhere('notification.recipient_type = :recipientType', { recipientType })
      .andWhere('notification.created_at > :oneDayAgo', { oneDayAgo })
      .orderBy('notification.created_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer les notifications par type
   */
  async findByRecipientAndType(
    recipientId: number,
    recipientType: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    return this.find({
      where: {
        recipient_id: recipientId,
        recipient_type: recipientType,
        type,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(recipientId: number, recipientType: string): Promise<void> {
    await this.update(
      {
        recipient_id: recipientId,
        recipient_type: recipientType,
        is_read: false,
      },
      {
        is_read: true,
        read_at: new Date(),
      },
    );
  }

  /**
   * Marquer les notifications d'un certain type comme lues
   */
  async markTypeAsRead(
    recipientId: number,
    recipientType: string,
    type: NotificationType,
  ): Promise<void> {
    await this.update(
      {
        recipient_id: recipientId,
        recipient_type: recipientType,
        type,
        is_read: false,
      },
      {
        is_read: true,
        read_at: new Date(),
      },
    );
  }

  /**
   * Supprimer les anciennes notifications (plus de X jours)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.createQueryBuilder('notification')
      .delete()
      .where('notification.created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Supprimer toutes les notifications lues d'un destinataire
   */
  async deleteReadByRecipient(recipientId: number, recipientType: string): Promise<number> {
    const result = await this.delete({
      recipient_id: recipientId,
      recipient_type: recipientType,
      is_read: true,
    });

    return result.affected || 0;
  }

  /**
   * Récupérer les notifications paginées
   */
  async findPaginated(
    recipientId: number,
    recipientType: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.findAndCount({
      where: {
        recipient_id: recipientId,
        recipient_type: recipientType,
      },
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { notifications, total };
  }

  /**
   * Vérifier si une notification existe déjà (pour éviter les doublons)
   */
  async notificationExists(
    recipientId: number,
    recipientType: string,
    type: NotificationType,
    actorId: number,
    actorType: string,
    dataKey?: string,
    dataValue?: any,
  ): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('notification')
      .where('notification.recipient_id = :recipientId', { recipientId })
      .andWhere('notification.recipient_type = :recipientType', { recipientType })
      .andWhere('notification.type = :type', { type })
      .andWhere('notification.actor_id = :actorId', { actorId })
      .andWhere('notification.actor_type = :actorType', { actorType });

    if (dataKey && dataValue !== undefined) {
      queryBuilder.andWhere(`notification.data->>'${dataKey}' = :dataValue`, {
        dataValue: String(dataValue),
      });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
