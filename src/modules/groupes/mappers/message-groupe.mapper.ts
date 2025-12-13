// modules/groupes/mappers/message-groupe.mapper.ts
import { Injectable } from '@nestjs/common';
import { MessageGroupe } from '../entities/message-groupe.entity';

@Injectable()
export class MessageGroupeMapper {
  /**
   * Convertir une entité MessageGroupe en données publiques
   */
  toPublicData(message: MessageGroupe, currentUserId?: number) {
    return {
      id: message.id,
      groupe_id: message.groupe_id,
      sender: {
        id: message.sender_id,
        type: message.sender_type,
      },
      contenu: message.contenu,
      type: message.type,
      statut: message.statut,
      fichiers: message.fichiers || [],
      metadata: message.metadata,
      is_pinned: message.is_pinned,
      is_edited: message.is_edited,
      edited_at: message.edited_at,
      read_count: message.getReadCount(),
      is_read_by_me: currentUserId ? message.isReadBy(currentUserId) : false,
      created_at: message.created_at,
      updated_at: message.updated_at,
    };
  }

  /**
   * Convertir un tableau de messages en données publiques
   */
  toPublicDataArray(messages: MessageGroupe[], currentUserId?: number) {
    return messages.map((message) => this.toPublicData(message, currentUserId));
  }

  /**
   * Convertir en données détaillées (avec la liste complète des lecteurs)
   */
  toDetailedData(message: MessageGroupe, currentUserId?: number) {
    return {
      ...this.toPublicData(message, currentUserId),
      read_by: message.read_by || [],
    };
  }
}
