// modules/messages/mappers/conversation.mapper.ts
import { Injectable } from '@nestjs/common';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class ConversationMapper {
  toPublicData(
    conversation: Conversation,
    participant1?: User | Societe,
    participant2?: User | Societe,
    unreadCount?: number,
    currentUserId?: number,
    currentUserType?: string,
  ) {
    return {
      id: conversation.id,
      participant1: participant1
        ? this.mapParticipant(participant1, conversation.participant1_type)
        : {
            id: conversation.participant1_id,
            type: conversation.participant1_type,
          },
      participant2: participant2
        ? this.mapParticipant(participant2, conversation.participant2_type)
        : {
            id: conversation.participant2_id,
            type: conversation.participant2_type,
          },
      titre: conversation.titre,
      dernier_message_at: conversation.dernier_message_at,
      is_archived: currentUserId && currentUserType
        ? conversation.isArchivedFor(currentUserId, currentUserType)
        : false,
      metadata: conversation.metadata,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      unread_count: unreadCount || 0,
    };
  }

  toListData(
    conversation: Conversation,
    unreadCount?: number,
    currentUserId?: number,
    currentUserType?: string,
  ) {
    return {
      id: conversation.id,
      participant1_id: conversation.participant1_id,
      participant1_type: conversation.participant1_type,
      participant2_id: conversation.participant2_id,
      participant2_type: conversation.participant2_type,
      titre: conversation.titre,
      dernier_message_at: conversation.dernier_message_at,
      is_archived: currentUserId && currentUserType
        ? conversation.isArchivedFor(currentUserId, currentUserType)
        : false,
      created_at: conversation.created_at,
      unread_count: unreadCount || 0,
    };
  }

  private mapParticipant(participant: User | Societe, type: string) {
    if (type === 'User') {
      const user = participant as User;
      return {
        id: user.id,
        type: 'User',
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        activite: user.activite,
      };
    } else {
      const societe = participant as Societe;
      return {
        id: societe.id,
        type: 'Societe',
        nom_societe: societe.nom_societe,
        email: societe.email,
        secteur_activite: societe.secteur_activite,
      };
    }
  }
}
