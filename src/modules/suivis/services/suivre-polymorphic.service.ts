// modules/suivis/services/suivre-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suivre } from '../entities/suivre.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques de Suivre
 *
 * Un User peut suivre:
 * - Un autre User (followed_type = 'User')
 * - Une Societe (followed_type = 'Societe')
 */
@Injectable()
export class SuivrePolymorphicService {
  constructor(
    @InjectRepository(Suivre)
    private readonly suivreRepository: Repository<Suivre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
  ) {}

  /**
   * Récupérer l'entité suivie (User ou Societe)
   * Équivalent: $suivre->followed dans Laravel
   */
  async getFollowedEntity(suivre: Suivre): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: suivre.followed_id,
        type: suivre.followed_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer tous les utilisateurs suivis par un user
   */
  async getUsersFollowedBy(userId: number): Promise<User[]> {
    const suivres = await this.suivreRepository.find({
      where: {
        user_id: userId,
        followed_type: PolymorphicTypes.USER,
      },
    });

    const userIds = suivres.map((s) => s.followed_id);
    if (userIds.length === 0) return [];

    return this.userRepository.findByIds(userIds);
  }

  /**
   * Récupérer toutes les sociétés suivies par un user
   */
  async getSocietesFollowedBy(userId: number): Promise<Societe[]> {
    const suivres = await this.suivreRepository.find({
      where: {
        user_id: userId,
        followed_type: PolymorphicTypes.SOCIETE,
      },
    });

    const societeIds = suivres.map((s) => s.followed_id);
    if (societeIds.length === 0) return [];

    return this.societeRepository.findByIds(societeIds);
  }

  /**
   * Récupérer les followers d'un user (uniquement les Users qui suivent)
   */
  async getUserFollowers(userId: number): Promise<User[]> {
    const suivres = await this.suivreRepository.find({
      where: {
        followed_id: userId,
        followed_type: PolymorphicTypes.USER,
        user_type: 'User', // Uniquement les Users
      },
    });

    // Charger les Users qui suivent
    const userIds = suivres.map(s => s.user_id);
    if (userIds.length === 0) return [];

    return this.userRepository.find({
      where: userIds.map(id => ({ id }))
    });
  }

  /**
   * Récupérer les followers d'une société (uniquement les Users qui suivent)
   */
  async getSocieteFollowers(societeId: number): Promise<User[]> {
    const suivres = await this.suivreRepository.find({
      where: {
        followed_id: societeId,
        followed_type: PolymorphicTypes.SOCIETE,
        user_type: 'User', // Uniquement les Users
      },
    });

    // Charger les Users qui suivent
    const userIds = suivres.map(s => s.user_id);
    if (userIds.length === 0) return [];

    return this.userRepository.find({
      where: userIds.map(id => ({ id }))
    });
  }

  /**
   * Récupérer plusieurs suivis avec leurs entités suivies
   */
  async getSuivresWithFollowedEntities(suivreIds: number[]): Promise<
    Array<{
      suivre: Suivre;
      followed: User | Societe;
    }>
  > {
    const suivres = await this.suivreRepository.findByIds(suivreIds);

    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    const result = await Promise.all(
      suivres.map(async (suivre) => {
        const followed = await PolymorphicHelper.morphTo<User | Societe>(
          {
            id: suivre.followed_id,
            type: suivre.followed_type,
          },
          repositories,
        );

        return { suivre, followed: followed! };
      }),
    );

    return result;
  }

  /**
   * Compter les utilisateurs suivis par un user
   */
  async countUsersFollowed(userId: number): Promise<number> {
    return this.suivreRepository.count({
      where: {
        user_id: userId,
        followed_type: PolymorphicTypes.USER,
      },
    });
  }

  /**
   * Compter les sociétés suivies par un user
   */
  async countSocietesFollowed(userId: number): Promise<number> {
    return this.suivreRepository.count({
      where: {
        user_id: userId,
        followed_type: PolymorphicTypes.SOCIETE,
      },
    });
  }

  /**
   * Compter les followers d'un user
   */
  async countUserFollowers(userId: number): Promise<number> {
    return this.suivreRepository.count({
      where: {
        followed_id: userId,
        followed_type: PolymorphicTypes.USER,
      },
    });
  }

  /**
   * Compter les followers d'une société
   */
  async countSocieteFollowers(societeId: number): Promise<number> {
    return this.suivreRepository.count({
      where: {
        followed_id: societeId,
        followed_type: PolymorphicTypes.SOCIETE,
      },
    });
  }
}
