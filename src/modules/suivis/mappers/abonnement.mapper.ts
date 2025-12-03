// modules/suivis/mappers/abonnement.mapper.ts
import { Injectable } from '@nestjs/common';
import { Abonnement, AbonnementPlan } from '../entities/abonnement.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { PagePartenariat } from '../../partenariats/entities/page-partenariat.entity';
import { Groupe } from '../../groupes/entities/groupe.entity';

export interface AbonnementPublicData {
  id: number;
  user_id: number;
  societe_id: number;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    activite: string;
  };
  societe?: {
    id: number;
    nom_societe: string;
    secteur_activite: string;
  };
  statut: string;
  plan_collaboration: string;
  secteur_collaboration: string;
  role_utilisateur: string | null;
  solde_compte: string;
  permissions: string[];
  page_partenariat_id: number | null;
  page_partenariat_creee: boolean;
  pagePartenariat?: {
    id: number;
    titre: string;
    visibilite: string;
    secteur_activite: string;
  };
  groupe_collaboration_id: number | null;
  groupeCollaboration?: {
    id: number;
    nom: string;
    type: string;
  };
  date_debut: Date;
  date_fin: Date | null;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  can_upgrade: {
    standard: boolean;
    premium: boolean;
    enterprise: boolean;
  };
}

@Injectable()
export class AbonnementMapper {
  toPublicData(abonnement: Abonnement): AbonnementPublicData {
    return {
      id: abonnement.id,
      user_id: abonnement.user_id,
      societe_id: abonnement.societe_id,
      user: abonnement.user ? {
        id: abonnement.user.id,
        nom: abonnement.user.nom,
        prenom: abonnement.user.prenom,
        activite: abonnement.user.activite,
      } : undefined,
      societe: abonnement.societe ? {
        id: abonnement.societe.id,
        nom_societe: abonnement.societe.nom_societe,
        secteur_activite: abonnement.societe.secteur_activite,
      } : undefined,
      statut: abonnement.statut,
      plan_collaboration: abonnement.plan_collaboration,
      secteur_collaboration: abonnement.secteur_collaboration,
      role_utilisateur: abonnement.role_utilisateur,
      solde_compte: abonnement.solde_compte.toString(),
      permissions: abonnement.permissions || [],
      page_partenariat_id: abonnement.page_partenariat_id,
      page_partenariat_creee: abonnement.page_partenariat_creee,
      pagePartenariat: abonnement.pagePartenariat ? {
        id: abonnement.pagePartenariat.id,
        titre: abonnement.pagePartenariat.titre,
        visibilite: abonnement.pagePartenariat.visibilite,
        secteur_activite: abonnement.pagePartenariat.secteur_activite,
      } : undefined,
      groupe_collaboration_id: abonnement.groupe_collaboration_id,
      groupeCollaboration: abonnement.groupeCollaboration ? {
        id: abonnement.groupeCollaboration.id,
        nom: abonnement.groupeCollaboration.nom,
        type: abonnement.groupeCollaboration.type,
      } : undefined,
      date_debut: abonnement.date_debut,
      date_fin: abonnement.date_fin,
      created_at: abonnement.created_at,
      updated_at: abonnement.updated_at,
      is_active: abonnement.isActive(),
      can_upgrade: {
        standard: abonnement.peutUpgraderVers(AbonnementPlan.STANDARD),
        premium: abonnement.peutUpgraderVers(AbonnementPlan.PREMIUM),
        enterprise: abonnement.peutUpgraderVers(AbonnementPlan.ENTERPRISE),
      },
    };
  }

  toList(abonnements: Abonnement[]): AbonnementPublicData[] {
    return abonnements.map(a => this.toPublicData(a));
  }

  toMinimalData(abonnement: Abonnement) {
    return {
      id: abonnement.id,
      statut: abonnement.statut,
      plan_collaboration: abonnement.plan_collaboration,
      secteur_collaboration: abonnement.secteur_collaboration,
      is_active: abonnement.isActive(),
      date_debut: abonnement.date_debut,
      date_fin: abonnement.date_fin,
    };
  }

  toStatsData(abonnement: Abonnement) {
    return {
      id: abonnement.id,
      user_id: abonnement.user_id,
      societe_id: abonnement.societe_id,
      statut: abonnement.statut,
      plan_collaboration: abonnement.plan_collaboration,
      solde_compte: abonnement.solde_compte.toString(),
      page_partenariat_creee: abonnement.page_partenariat_creee,
      groupe_collaboration_id: abonnement.groupe_collaboration_id,
      date_debut: abonnement.date_debut,
      date_fin: abonnement.date_fin,
    };
  }
}
