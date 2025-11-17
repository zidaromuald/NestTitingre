// modules/groupes/repositories/groupe.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Groupe, GroupeType, GroupeCategorie } from '../entities/groupe.entity';
import { GroupeUser } from '../entities/groupe-user.entity';

@Injectable()
export class GroupeRepository extends Repository<Groupe> {
  constructor(private dataSource: DataSource) {
    super(Groupe, dataSource.createEntityManager());
  }

  /**
   * Rechercher des groupes par nom
   */
  async searchByNom(query: string, limit: number = 20): Promise<Groupe[]> {
    return this.createQueryBuilder('groupe')
      .where('groupe.nom LIKE :query', { query: `%${query}%` })
      .orderBy('groupe.created_at', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Trouver les groupes d'un utilisateur
   */
  async findByUserId(userId: number): Promise<Groupe[]> {
    return this.createQueryBuilder('groupe')
      .innerJoin('groupe_users', 'gu', 'gu.groupe_id = groupe.id')
      .where('gu.member_id = :userId AND gu.member_type = :memberType', { userId, memberType: 'User' })
      .orderBy('gu.joined_at', 'DESC')
      .getMany();
  }

  /**
   * Trouver les groupes créés par un user ou société
   */
  async findByCreator(creatorId: number, creatorType: string): Promise<Groupe[]> {
    return this.find({
      where: {
        created_by_id: creatorId,
        created_by_type: creatorType,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Trouver les groupes publics
   */
  async findPublicGroupes(limit: number = 50): Promise<Groupe[]> {
    return this.find({
      where: {
        type: GroupeType.PUBLIC,
      },
      order: {
        created_at: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Compter les membres d'un groupe
   */
  async countMembres(groupeId: number): Promise<number> {
    return this.dataSource
      .getRepository(GroupeUser)
      .count({
        where: { groupe_id: groupeId },
      });
  }

  /**
   * Vérifier si un user est membre d'un groupe
   */
  async isUserMembre(groupeId: number, userId: number): Promise<boolean> {
    const count = await this.dataSource
      .getRepository(GroupeUser)
      .count({
        where: {
          groupe_id: groupeId,
          member_id: userId,
          member_type: 'User',
        },
      });
    return count > 0;
  }

  /**
   * Récupérer le rôle d'un membre dans un groupe
   */
  async getMembreRole(groupeId: number, userId: number): Promise<string | null> {
    const groupeUser = await this.dataSource
      .getRepository(GroupeUser)
      .findOne({
        where: {
          groupe_id: groupeId,
          member_id: userId,
          member_type: 'User',
        },
      });
    return groupeUser?.role || null;
  }

  /**
   * Rechercher des groupes avec filtres
   */
  async searchWithFilters(filters: {
    nom?: string;
    type?: GroupeType;
    categorie?: GroupeCategorie;
    limit?: number;
    offset?: number;
  }): Promise<[Groupe[], number]> {
    const query = this.createQueryBuilder('groupe');

    if (filters.nom) {
      query.andWhere('groupe.nom LIKE :nom', { nom: `%${filters.nom}%` });
    }

    if (filters.type) {
      query.andWhere('groupe.type = :type', { type: filters.type });
    }

    if (filters.categorie) {
      query.andWhere('groupe.categorie = :categorie', {
        categorie: filters.categorie,
      });
    }

    query
      .orderBy('groupe.created_at', 'DESC')
      .take(filters.limit || 50)
      .skip(filters.offset || 0);

    return query.getManyAndCount();
  }
}
