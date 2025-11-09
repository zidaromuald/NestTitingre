// modules/notifications/mappers/notification.mapper.ts
import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationMapper {
  toPublicData(notification: Notification) {
    return {
      id: notification.id,
      recipient: {
        id: notification.recipient_id,
        type: notification.recipient_type,
      },
      actor: notification.actor_id
        ? {
            id: notification.actor_id,
            type: notification.actor_type,
          }
        : null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      action_url: notification.action_url,
      is_read: notification.is_read,
      read_at: notification.read_at,
      is_recent: notification.isRecent(),
      is_system: notification.isSystemNotification(),
      created_at: notification.created_at,
      updated_at: notification.updated_at,
    };
  }

  toListData(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message.substring(0, 100) + (notification.message.length > 100 ? '...' : ''),
      is_read: notification.is_read,
      is_recent: notification.isRecent(),
      created_at: notification.created_at,
    };
  }
}
