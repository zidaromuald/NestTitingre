// modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationMapper } from './mappers/notification.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference])],
  providers: [
    // Repositories
    NotificationRepository,
    NotificationPreferenceRepository,
    // Mappers
    NotificationMapper,
    // Services
    NotificationService,
    NotificationPreferenceService,
  ],
  controllers: [NotificationController],
  exports: [
    // Repositories
    NotificationRepository,
    NotificationPreferenceRepository,
    // Mappers
    NotificationMapper,
    // Services
    NotificationService,
    NotificationPreferenceService,
  ],
})
export class NotificationsModule {}
