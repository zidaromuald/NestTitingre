// modules/messages/mappers/message-collaboration.mapper.ts
import { Injectable } from '@nestjs/common';
import { MessageCollaboration } from '../entities/message-collaboration.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class MessageCollaborationMapper {
  toPublicData(
    message: MessageCollaboration,
    sender?: User | Societe,
    recipient?: User | Societe,
  ) {
    return {
      id: message.id,
      conversation_id: message.conversation_id,
      sender: sender
        ? this.mapParticipant(sender, message.sender_type)
        : {
            id: message.sender_id,
            type: message.sender_type,
          },
      recipient: recipient
        ? this.mapParticipant(recipient, message.recipient_type)
        : {
            id: message.recipient_id,
            type: message.recipient_type,
          },
      contenu: message.contenu,
      type: message.type,
      statut: message.statut,
      lu_a: message.lu_a,
      fichiers: message.fichiers,
      transaction_collaboration_id: message.transaction_collaboration_id,
      abonnement_id: message.abonnement_id,
      metadata: message.metadata,
      created_at: message.created_at,
      updated_at: message.updated_at,
      is_system: message.isMessageSystem(),
      is_read: message.isRead(),
    };
  }

  toListData(message: MessageCollaboration) {
    return {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender_type: message.sender_type,
      contenu: message.contenu.substring(0, 100) + (message.contenu.length > 100 ? '...' : ''),
      type: message.type,
      statut: message.statut,
      created_at: message.created_at,
      is_read: message.isRead(),
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
      };
    } else {
      const societe = participant as Societe;
      return {
        id: societe.id,
        type: 'Societe',
        nom_societe: societe.nom_societe,
      };
    }
  }
}
