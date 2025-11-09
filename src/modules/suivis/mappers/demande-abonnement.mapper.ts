// modules/suivis/mappers/demande-abonnement.mapper.ts
import { Injectable } from '@nestjs/common';
import { DemandeAbonnement } from '../entities/demande-abonnement.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Injectable()
export class DemandeAbonnementMapper {
  toPublicData(demande: DemandeAbonnement, user?: User, societe?: Societe) {
    return {
      id: demande.id,
      user: user ? {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        activite: user.activite,
      } : { id: demande.user_id },
      societe: societe ? {
        id: societe.id,
        nom_societe: societe.nom_societe,
        secteur_activite: societe.secteur_activite,
      } : { id: demande.societe_id },
      user_id: demande.user_id,
      societe_id: demande.societe_id,
      status: demande.status,
      plan_demande: demande.plan_demande,
      secteur_collaboration: demande.secteur_collaboration,
      role_utilisateur: demande.role_utilisateur,
      titre_partenariat: demande.titre_partenariat,
      description_partenariat: demande.description_partenariat,
      message: demande.message,
      expires_at: demande.expires_at,
      responded_at: demande.responded_at,
      created_at: demande.created_at,
      can_be_accepted: demande.canBeAccepted(),
      is_expired: demande.isExpired(),
    };
  }
}
