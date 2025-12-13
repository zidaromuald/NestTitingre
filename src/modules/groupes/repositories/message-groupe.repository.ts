// modules/groupes/repositories/message-groupe.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageGroupe, MessageGroupeStatut } from '../entities/message-groupe.entity';

@Injectable()
export class MessageGroupeRepository {
  constructor(
    @InjectRepository(MessageGroupe)
    private readonly repository: Repository<MessageGroupe>,
  ) {}

  /**
   * Récupérer tous les messages d'un groupe (par ordre chronologique)
   */
  async findByGroupeId(groupeId: number, limit = 100, offset = 0): Promise<MessageGroupe[]> {
    return this.repository.find({
      where: {
        groupe_id: groupeId,
        statut: MessageGroupeStatut.SENT,
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Récupérer les messages non lus pour un utilisateur dans un groupe
   */
  async findUnreadByUserInGroupe(
    groupeId: number,
    userId: number,
  ): Promise<MessageGroupe[]> {
    return this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.sender_id != :userId', { userId })
      .andWhere(
        `(message.read_by IS NULL OR NOT (message.read_by::jsonb @> :userIdJson))`,
        { userIdJson: JSON.stringify([userId]) },
      )
      .orderBy('message.created_at', 'DESC')
      .getMany();
  }

  /**
   * Compter les messages non lus pour un utilisateur dans un groupe
   */
  async countUnreadByUserInGroupe(groupeId: number, userId: number): Promise<number> {
    return this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.sender_id != :userId', { userId })
      .andWhere(
        `(message.read_by IS NULL OR NOT (message.read_by::jsonb @> :userIdJson))`,
        { userIdJson: JSON.stringify([userId]) },
      )
      .getCount();
  }

  /**
   * Marquer tous les messages d'un groupe comme lus pour un utilisateur
   */
  async markAllAsReadByUser(groupeId: number, userId: number): Promise<void> {
    const messages = await this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.sender_id != :userId', { userId })
      .andWhere(
        `(message.read_by IS NULL OR NOT (message.read_by::jsonb @> :userIdJson))`,
        { userIdJson: JSON.stringify([userId]) },
      )
      .getMany();

    for (const message of messages) {
      message.markAsRead(userId);
      await this.repository.save(message);
    }
  }

  /**
   * Récupérer les messages épinglés d'un groupe
   */
  async findPinnedByGroupeId(groupeId: number): Promise<MessageGroupe[]> {
    return this.repository.find({
      where: {
        groupe_id: groupeId,
        is_pinned: true,
        statut: MessageGroupeStatut.SENT,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Récupérer un message par ID
   */
  async findById(messageId: number): Promise<MessageGroupe | null> {
    return this.repository.findOne({ where: { id: messageId } });
  }

  /**
   * Sauvegarder un message
   */
  async save(message: MessageGroupe): Promise<MessageGroupe> {
    return this.repository.save(message);
  }

  /**
   * Supprimer un message (soft delete)
   */
  async softDelete(messageId: number): Promise<void> {
    await this.repository.update(messageId, {
      statut: MessageGroupeStatut.DELETED,
    });
  }

  /**
   * Compter le nombre total de messages dans un groupe
   */
  async countByGroupeId(groupeId: number): Promise<number> {
    return this.repository.count({
      where: {
        groupe_id: groupeId,
        statut: MessageGroupeStatut.SENT,
      },
    });
  }

  /**
   * Récupérer les statistiques de messages d'un groupe
   */
  async getGroupeMessagesStats(groupeId: number): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const total = await this.countByGroupeId(groupeId);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const today = await this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.created_at >= :startOfDay', { startOfDay })
      .getCount();

    const thisWeek = await this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.created_at >= :startOfWeek', { startOfWeek })
      .getCount();

    const thisMonth = await this.repository
      .createQueryBuilder('message')
      .where('message.groupe_id = :groupeId', { groupeId })
      .andWhere('message.statut = :statut', { statut: MessageGroupeStatut.SENT })
      .andWhere('message.created_at >= :startOfMonth', { startOfMonth })
      .getCount();

    return {
      total,
      today,
      thisWeek,
      thisMonth,
    };
  }
}
