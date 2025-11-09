// modules/notifications/repositories/notification-preference.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationPreferenceRepository extends Repository<NotificationPreference> {
  constructor(private dataSource: DataSource) {
    super(NotificationPreference, dataSource.createEntityManager());
  }

  /**
   * Récupérer toutes les préférences d'un propriétaire
   */
  async findByOwner(ownerId: number, ownerType: string): Promise<NotificationPreference[]> {
    return this.find({
      where: {
        owner_id: ownerId,
        owner_type: ownerType,
      },
      order: {
        notification_type: 'ASC',
      },
    });
  }

  /**
   * Récupérer une préférence spécifique
   */
  async findPreference(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
  ): Promise<NotificationPreference | null> {
    return this.findOne({
      where: {
        owner_id: ownerId,
        owner_type: ownerType,
        notification_type: notificationType,
      },
    });
  }

  /**
   * Vérifier si un type de notification est activé
   * Retourne true si activé ou si aucune préférence n'existe (activé par défaut)
   */
  async isEnabled(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
  ): Promise<boolean> {
    const preference = await this.findPreference(ownerId, ownerType, notificationType);

    // Si aucune préférence n'existe, c'est activé par défaut
    if (!preference) {
      return true;
    }

    return preference.is_enabled;
  }

  /**
   * Créer ou mettre à jour une préférence
   */
  async setPreference(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
    isEnabled: boolean,
  ): Promise<NotificationPreference> {
    const existing = await this.findPreference(ownerId, ownerType, notificationType);

    if (existing) {
      existing.is_enabled = isEnabled;
      return this.save(existing);
    }

    const newPreference = this.create({
      owner_id: ownerId,
      owner_type: ownerType,
      notification_type: notificationType,
      is_enabled: isEnabled,
    });

    return this.save(newPreference);
  }

  /**
   * Activer toutes les notifications
   */
  async enableAll(ownerId: number, ownerType: string): Promise<void> {
    await this.update(
      {
        owner_id: ownerId,
        owner_type: ownerType,
      },
      {
        is_enabled: true,
      },
    );
  }

  /**
   * Désactiver toutes les notifications
   */
  async disableAll(ownerId: number, ownerType: string): Promise<void> {
    await this.update(
      {
        owner_id: ownerId,
        owner_type: ownerType,
      },
      {
        is_enabled: false,
      },
    );
  }

  /**
   * Obtenir les types de notifications activés
   */
  async getEnabledTypes(ownerId: number, ownerType: string): Promise<NotificationType[]> {
    const preferences = await this.find({
      where: {
        owner_id: ownerId,
        owner_type: ownerType,
        is_enabled: true,
      },
    });

    return preferences.map((p) => p.notification_type);
  }

  /**
   * Obtenir les types de notifications désactivés
   */
  async getDisabledTypes(ownerId: number, ownerType: string): Promise<NotificationType[]> {
    const preferences = await this.find({
      where: {
        owner_id: ownerId,
        owner_type: ownerType,
        is_enabled: false,
      },
    });

    return preferences.map((p) => p.notification_type);
  }
}
