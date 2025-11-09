// modules/notifications/controllers/notification.controller.ts
import { Controller, Get, Put, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { NotificationMapper } from '../mappers/notification.mapper';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly preferenceService: NotificationPreferenceService,
    private readonly notificationMapper: NotificationMapper,
  ) {}

  /**
   * Récupérer toutes les notifications
   * GET /notifications
   */
  @Get()
  async getNotifications(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 20) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const result = await this.notificationService.getPaginatedNotifications(mockUserId, mockUserType, page, limit);

    return {
      success: true,
      data: result.notifications.map((n) => this.notificationMapper.toPublicData(n)),
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit,
      },
    };
  }

  /**
   * Récupérer les notifications non lues
   * GET /notifications/unread
   */
  @Get('unread')
  async getUnreadNotifications() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const notifications = await this.notificationService.getUnreadNotifications(mockUserId, mockUserType);

    return {
      success: true,
      data: notifications.map((n) => this.notificationMapper.toPublicData(n)),
      meta: { count: notifications.length },
    };
  }

  /**
   * Compter les notifications non lues
   * GET /notifications/unread/count
   */
  @Get('unread/count')
  async countUnread() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const count = await this.notificationService.countUnread(mockUserId, mockUserType);

    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Récupérer les notifications récentes (24h)
   * GET /notifications/recent
   */
  @Get('recent')
  async getRecentNotifications() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const notifications = await this.notificationService.getRecentNotifications(mockUserId, mockUserType);

    return {
      success: true,
      data: notifications.map((n) => this.notificationMapper.toPublicData(n)),
      meta: { count: notifications.length },
    };
  }

  /**
   * Marquer une notification comme lue
   * PUT /notifications/:id/read
   */
  @Put(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const notification = await this.notificationService.markAsRead(id, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Notification marquée comme lue',
      data: this.notificationMapper.toPublicData(notification),
    };
  }

  /**
   * Marquer toutes les notifications comme lues
   * PUT /notifications/read-all
   */
  @Put('read-all')
  async markAllAsRead() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    await this.notificationService.markAllAsRead(mockUserId, mockUserType);

    return {
      success: true,
      message: 'Toutes les notifications marquées comme lues',
    };
  }

  /**
   * Supprimer une notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  async deleteNotification(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    await this.notificationService.deleteNotification(id, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Notification supprimée',
    };
  }

  /**
   * Supprimer toutes les notifications lues
   * DELETE /notifications/read
   */
  @Delete('read')
  async deleteReadNotifications() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const count = await this.notificationService.deleteReadNotifications(mockUserId, mockUserType);

    return {
      success: true,
      message: `${count} notification(s) supprimée(s)`,
      data: { count },
    };
  }

  /**
   * Récupérer les préférences de notifications
   * GET /notifications/preferences
   */
  @Get('preferences')
  async getPreferences() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const preferences = await this.preferenceService.getAllPreferencesWithDefaults(mockUserId, mockUserType);

    return {
      success: true,
      data: preferences,
    };
  }

  /**
   * Mettre à jour une préférence de notification
   * PUT /notifications/preferences/:type
   */
  @Put('preferences/:type')
  async updatePreference(@Param('type') type: string, @Query('enabled') enabled: string) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    const isEnabled = enabled === 'true';
    const preference = await this.preferenceService.updatePreference(mockUserId, mockUserType, type as any, isEnabled);

    return {
      success: true,
      message: 'Préférence mise à jour',
      data: preference,
    };
  }

  /**
   * Activer toutes les notifications
   * PUT /notifications/preferences/enable-all
   */
  @Put('preferences/enable-all')
  async enableAll() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    await this.preferenceService.enableAll(mockUserId, mockUserType);

    return {
      success: true,
      message: 'Toutes les notifications activées',
    };
  }

  /**
   * Désactiver toutes les notifications
   * PUT /notifications/preferences/disable-all
   */
  @Put('preferences/disable-all')
  async disableAll() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User'; // TODO: JWT

    await this.preferenceService.disableAll(mockUserId, mockUserType);

    return {
      success: true,
      message: 'Toutes les notifications désactivées',
    };
  }
}
