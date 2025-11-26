// modules/suivis/mappers/invitation-suivi.mapper.ts
import { Injectable } from '@nestjs/common';
import { InvitationSuivi } from '../entities/invitation-suivi.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class InvitationSuiviMapper {
  toPublicData(invitation: InvitationSuivi, sender?: User | Societe, receiver?: User | Societe) {
    return {
      id: invitation.id,
      sender: sender ? this.mapEntity(sender, invitation.sender_type) : {
        id: invitation.sender_id,
        type: invitation.sender_type
      },
      receiver: receiver ? this.mapEntity(receiver, invitation.receiver_type) : {
        id: invitation.receiver_id,
        type: invitation.receiver_type
      },
      sender_id: invitation.sender_id,
      sender_type: invitation.sender_type,
      receiver_id: invitation.receiver_id,
      receiver_type: invitation.receiver_type,
      status: invitation.status,
      message: invitation.message,
      expires_at: invitation.expires_at,
      responded_at: invitation.responded_at,
      created_at: invitation.created_at,
      can_be_accepted: invitation.canBeAccepted(),
      is_expired: invitation.isExpired(),
    };
  }

  mapEntity(entity: User | Societe, type: string) {
    if (type === 'User') {
      const user = entity as User;
      return { id: user.id, nom: user.nom, prenom: user.prenom, type: 'User' };
    } else {
      const societe = entity as Societe;
      return { id: societe.id, nom_societe: societe.nom_societe, type: 'Societe' };
    }
  }
}
