// modules/suivis/mappers/suivre.mapper.ts
import { Injectable } from '@nestjs/common';
import { Suivre } from '../entities/suivre.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

export interface SuivrePublicData {
  id: number;
  user_id: number;
  user_type: string;
  user?: any;
  followed_id: number;
  followed_type: string;
  followed?: any;
  notifications_posts: boolean;
  notifications_email: boolean;
  derniere_visite: Date | null;
  score_engagement: number;
  has_abonnement: boolean;
  created_at: Date;
}

@Injectable()
export class SuivreMapper {
  toPublicData(suivre: Suivre, user?: User | Societe, followed?: User | Societe): SuivrePublicData {
    return {
      id: suivre.id,
      user_id: suivre.user_id,
      user_type: suivre.user_type,
      user: user ? this.mapEntity(user, suivre.user_type) : undefined,
      followed_id: suivre.followed_id,
      followed_type: suivre.followed_type,
      followed: followed ? this.mapEntity(followed, suivre.followed_type) : undefined,
      notifications_posts: suivre.notifications_posts,
      notifications_email: suivre.notifications_email,
      derniere_visite: suivre.derniere_visite,
      score_engagement: suivre.calculerScoreEngagement(),
      has_abonnement: suivre.hasAbonnement(),
      created_at: suivre.created_at,
    };
  }

  mapEntity(entity: User | Societe, type: string): any {
    if (type === 'User') {
      const user = entity as User;
      return { id: user.id, nom: user.nom, prenom: user.prenom, activite: user.activite, type: 'User' };
    } else {
      const societe = entity as Societe;
      return { id: societe.id, nom_societe: societe.nom_societe, secteur_activite: societe.secteur_activite, type: 'Societe' };
    }
  }

  toList(suivres: Array<{ suivre: Suivre; user?: User | Societe; followed?: User | Societe }>): SuivrePublicData[] {
    return suivres.map(({ suivre, user, followed }) => this.toPublicData(suivre, user, followed));
  }
}
