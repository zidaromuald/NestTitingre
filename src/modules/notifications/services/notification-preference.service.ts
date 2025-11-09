// modules/notifications/services/notification-preference.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    private readonly preferenceRepository: NotificationPreferenceRepository,
  ) {}

  /**
   * Récupérer toutes les préférences d'un propriétaire
   */
  async getPreferences(ownerId: number, ownerType: string): Promise<NotificationPreference[]> {
    return this.preferenceRepository.findByOwner(ownerId, ownerType);
  }

  /**
   * Récupérer une préférence spécifique
   */
  async getPreference(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
  ): Promise<NotificationPreference | null> {
    return this.preferenceRepository.findPreference(ownerId, ownerType, notificationType);
  }

  /**
   * Vérifier si un type de notification est activé
   */
  async isEnabled(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
  ): Promise<boolean> {
    return this.preferenceRepository.isEnabled(ownerId, ownerType, notificationType);
  }

  /**
   * Mettre à jour une préférence
   */
  async updatePreference(
    ownerId: number,
    ownerType: string,
    notificationType: NotificationType,
    isEnabled: boolean,
  ): Promise<NotificationPreference> {
    return this.preferenceRepository.setPreference(ownerId, ownerType, notificationType, isEnabled);
  }

  /**
   * Activer toutes les notifications
   */
  async enableAll(ownerId: number, ownerType: string): Promise<void> {
    await this.preferenceRepository.enableAll(ownerId, ownerType);
  }

  /**
   * Désactiver toutes les notifications
   */
  async disableAll(ownerId: number, ownerType: string): Promise<void> {
    await this.preferenceRepository.disableAll(ownerId, ownerType);
  }

  /**
   * Obtenir les types de notifications activés
   */
  async getEnabledTypes(ownerId: number, ownerType: string): Promise<NotificationType[]> {
    return this.preferenceRepository.getEnabledTypes(ownerId, ownerType);
  }

  /**
   * Obtenir les types de notifications désactivés
   */
  async getDisabledTypes(ownerId: number, ownerType: string): Promise<NotificationType[]> {
    return this.preferenceRepository.getDisabledTypes(ownerId, ownerType);
  }

  /**
   * Obtenir toutes les préférences avec leur statut (activé/désactivé)
   * Si aucune préférence n'existe pour un type, il est considéré comme activé par défaut
   */
  async getAllPreferencesWithDefaults(
    ownerId: number,
    ownerType: string,
  ): Promise<{ type: NotificationType; enabled: boolean }[]> {
    const existingPreferences = await this.preferenceRepository.findByOwner(ownerId, ownerType);

    // Créer un map des préférences existantes
    const preferencesMap = new Map<NotificationType, boolean>();
    existingPreferences.forEach((pref) => {
      preferencesMap.set(pref.notification_type, pref.is_enabled);
    });

    // Retourner toutes les préférences avec valeurs par défaut
    return Object.values(NotificationType).map((type) => ({
      type: type as NotificationType,
      enabled: preferencesMap.get(type as NotificationType) ?? true, // true par défaut
    }));
  }

  /**
   * Mettre à jour plusieurs préférences en une seule fois
   */
  async updateMultiplePreferences(
    ownerId: number,
    ownerType: string,
    preferences: { type: NotificationType; enabled: boolean }[],
  ): Promise<NotificationPreference[]> {
    const updated: NotificationPreference[] = [];

    for (const pref of preferences) {
      const result = await this.preferenceRepository.setPreference(
        ownerId,
        ownerType,
        pref.type,
        pref.enabled,
      );
      updated.push(result);
    }

    return updated;
  }
}
