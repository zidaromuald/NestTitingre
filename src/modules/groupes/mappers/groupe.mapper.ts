// modules/groupes/mappers/groupe.mapper.ts
import { Injectable } from '@nestjs/common';
import { Groupe } from '../entities/groupe.entity';
import { GroupeUser } from '../entities/groupe-user.entity';

@Injectable()
export class GroupeMapper {
  /**
   * Transformer un groupe pour l'API publique
   */
  toPublicData(groupe: Groupe, membresCount?: number) {
    return {
      id: groupe.id,
      nom: groupe.nom,
      description: groupe.description,
      type: groupe.type,
      categorie: groupe.categorie,
      maxMembres: groupe.max_membres,
      nombreMembres: membresCount || 0,
      isFull: membresCount ? groupe.isFull(membresCount) : false,
      createdBy: {
        id: groupe.created_by_id,
        type: groupe.created_by_type,
      },
      adminUserId: groupe.admin_user_id,
      createdAt: groupe.created_at,
      updatedAt: groupe.updated_at,
    };
  }

  /**
   * Transformer un groupe avec ses détails complets
   */
  toDetailedData(
    groupe: Groupe,
    membresCount: number,
    profil?: any,
    creator?: any,
  ) {
    return {
      ...this.toPublicData(groupe, membresCount),
      profil: profil
        ? {
            avatar: profil.avatar_url,
            banniere: profil.banniere_url,
            apropos: profil.a_propos,
            regles: profil.regles,
          }
        : null,
      creator: creator
        ? {
            id: creator.id,
            type: groupe.created_by_type,
            nom:
              groupe.created_by_type === 'User'
                ? `${creator.prenom} ${creator.nom}`
                : creator.nom_societe,
          }
        : null,
    };
  }

  /**
   * Transformer les informations d'un membre du groupe
   */
  toMembreData(groupeUser: GroupeUser, user: any) {
    return {
      userId: user.id,
      nom: user.nom,
      prenom: user.prenom,
      role: groupeUser.role,
      status: groupeUser.status,
      joinedAt: groupeUser.joined_at,
    };
  }

  /**
   * Transformer la liste des groupes pour la recherche
   */
  toSearchResults(groupes: Groupe[], total: number, membresCountMap: Map<number, number>) {
    return {
      data: groupes.map((groupe) => {
        const membresCount = membresCountMap.get(groupe.id) || 0;
        return this.toPublicData(groupe, membresCount);
      }),
      meta: {
        total,
        count: groupes.length,
      },
    };
  }

  /**
   * Données minimales pour les listes
   */
  toListItem(groupe: Groupe, membresCount: number) {
    return {
      id: groupe.id,
      nom: groupe.nom,
      type: groupe.type,
      categorie: groupe.categorie,
      nombreMembres: membresCount,
      isFull: groupe.isFull(membresCount),
    };
  }
}
