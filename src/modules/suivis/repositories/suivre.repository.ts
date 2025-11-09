// modules/suivis/repositories/suivre.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Suivre } from '../entities/suivre.entity';

@Injectable()
export class SuivreRepository extends Repository<Suivre> {
  constructor(private dataSource: DataSource) {
    super(Suivre, dataSource.createEntityManager());
  }

  /**
   * Vérifier si une entité (User ou Societe) suit une autre entité
   */
  async isSuivant(userId: number, userType: string, followedId: number, followedType: string): Promise<boolean> {
    return (await this.count({
      where: {
        user_id: userId,
        user_type: userType,
        followed_id: followedId,
        followed_type: followedType
      }
    })) > 0;
  }

  /**
   * Récupérer un suivi spécifique
   */
  async findSuivi(userId: number, userType: string, followedId: number, followedType: string): Promise<Suivre | null> {
    return this.findOne({
      where: {
        user_id: userId,
        user_type: userType,
        followed_id: followedId,
        followed_type: followedType
      },
      relations: ['abonnement'],
    });
  }

  /**
   * Récupérer toutes les entités suivies par une entité (User ou Societe)
   */
  async findUserSuivis(userId: number, userType: string, type?: string): Promise<Suivre[]> {
    const where: any = { user_id: userId, user_type: userType };
    if (type) where.followed_type = type;
    return this.find({ where, order: { derniere_interaction: 'DESC' } });
  }

  /**
   * Récupérer tous les followers d'une entité
   */
  async findFollowers(followedId: number, followedType: string): Promise<Suivre[]> {
    return this.find({
      where: { followed_id: followedId, followed_type: followedType },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Compter les followers
   */
  async countFollowers(followedId: number, followedType: string): Promise<number> {
    return this.count({ where: { followed_id: followedId, followed_type: followedType } });
  }

  /**
   * Récupérer les suivis les plus engagés
   */
  async getTopEngagedFollowers(followedId: number, followedType: string, limit = 10): Promise<Suivre[]> {
    return this.createQueryBuilder('suivre')
      .where('suivre.followed_id = :followedId', { followedId })
      .andWhere('suivre.followed_type = :followedType', { followedType })
      .orderBy('suivre.total_likes + suivre.total_commentaires * 2 + suivre.total_partages * 3', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Récupérer les suivis avec abonnement (seulement pour User suivant Societe)
   */
  async getSuivisWithAbonnement(userId?: number, societeId?: number): Promise<Suivre[]> {
    const query = this.createQueryBuilder('suivre')
      .leftJoinAndSelect('suivre.abonnement', 'abonnement')
      .where('suivre.user_type = :userType', { userType: 'User' })
      .andWhere('suivre.followed_type = :type', { type: 'Societe' })
      .andWhere('abonnement.id IS NOT NULL');

    if (userId) query.andWhere('suivre.user_id = :userId', { userId });
    if (societeId) query.andWhere('suivre.followed_id = :societeId', { societeId });

    return query.getMany();
  }

  /**
   * Récupérer les suivis potentiels pour upgrade (User suivant Societe sans abonnement, engagés)
   */
  async getSuivisWithoutAbonnement(societeId: number, minEngagement = 5): Promise<Suivre[]> {
    return this.createQueryBuilder('suivre')
      .leftJoinAndSelect('suivre.abonnement', 'abonnement')
      .where('suivre.user_type = :userType', { userType: 'User' })
      .andWhere('suivre.followed_id = :societeId', { societeId })
      .andWhere('suivre.followed_type = :type', { type: 'Societe' })
      .andWhere('abonnement.id IS NULL')
      .andWhere('suivre.total_likes + suivre.total_commentaires + suivre.total_partages >= :minEngagement', { minEngagement })
      .orderBy('suivre.total_likes + suivre.total_commentaires * 2 + suivre.total_partages * 3', 'DESC')
      .getMany();
  }

  /**
   * Statistiques d'une société
   */
  async getSocieteStats(societeId: number): Promise<any> {
    const result = await this.createQueryBuilder('suivre')
      .select('COUNT(suivre.id)', 'total_followers')
      .addSelect('COUNT(CASE WHEN abonnement.id IS NOT NULL THEN 1 END)', 'total_abonnes')
      .addSelect('SUM(suivre.total_likes)', 'total_likes')
      .addSelect('SUM(suivre.total_commentaires)', 'total_commentaires')
      .addSelect('SUM(suivre.total_partages)', 'total_partages')
      .leftJoin('suivre.abonnement', 'abonnement')
      .where('suivre.followed_id = :societeId', { societeId })
      .andWhere('suivre.followed_type = :type', { type: 'Societe' })
      .getRawOne();

    return {
      total_followers: parseInt(result.total_followers) || 0,
      total_abonnes: parseInt(result.total_abonnes) || 0,
      total_likes: parseInt(result.total_likes) || 0,
      total_commentaires: parseInt(result.total_commentaires) || 0,
      total_partages: parseInt(result.total_partages) || 0,
    };
  }
}
