// modules/users/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Brackets } from 'typeorm';
import { User } from '../entities/user.entity';
import { SearchUserDto } from '../dto/search-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const isEmail = identifier.includes('@');
    
    return this.findOne({
      where: isEmail ? { email: identifier } : { numero: identifier },
    });
  }

  async searchUsers(
    searchDto: SearchUserDto,
    currentUserId?: number,
  ): Promise<[User[], number]> {
    const {
      nom,
      prenom,
      activite,
      ageMin,
      ageMax,
      emailVerified,
      sortBy,
      sortOrder,
      page,
      perPage,
    } = searchDto;

    const query = this.createQueryBuilder('user');

    // Exclure l'utilisateur connecté
    if (currentUserId) {
      query.where('user.id != :currentUserId', { currentUserId });
    }

    // Filtres de recherche
    if (nom) {
      query.andWhere('user.nom LIKE :nom', { nom: `%${nom}%` });
    }

    if (prenom) {
      query.andWhere('user.prenom LIKE :prenom', { prenom: `%${prenom}%` });
    }

    if (activite) {
      query.andWhere('user.activite LIKE :activite', {
        activite: `%${activite}%`,
      });
    }

    // Filtre par âge
    if (ageMin || ageMax) {
      const today = new Date();
      
      if (ageMin) {
        const maxBirthDate = new Date(
          today.getFullYear() - ageMin,
          today.getMonth(),
          today.getDate(),
        );
        query.andWhere('user.date_naissance <= :maxBirthDate', {
          maxBirthDate: maxBirthDate.toISOString().split('T')[0],
        });
      }
      
      if (ageMax) {
        const minBirthDate = new Date(
          today.getFullYear() - ageMax - 1,
          today.getMonth(),
          today.getDate() + 1,
        );
        query.andWhere('user.date_naissance >= :minBirthDate', {
          minBirthDate: minBirthDate.toISOString().split('T')[0],
        });
      }
    }

    // Filtre email vérifié
    if (emailVerified) {
      query.andWhere('user.email_verified_at IS NOT NULL');
    }

    // Sélection des colonnes
    query.select([
      'user.id',
      'user.nom',
      'user.prenom',
      'user.email',
      'user.numero',
      'user.activite',
      'user.date_naissance',
      'user.email_verified_at',
      'user.created_at',
    ]);

    // Tri
    const sortField = sortBy || 'created_at';
    const sortDirection = (sortOrder || 'desc').toUpperCase() as 'ASC' | 'DESC';
    query.orderBy(`user.${sortField}`, sortDirection);

    // Pagination
    const skip = (page - 1) * perPage;
    query.skip(skip).take(perPage);

    return query.getManyAndCount();
  }

  async autocomplete(term: string, currentUserId?: number): Promise<User[]> {
    const query = this.createQueryBuilder('user')
      .where(
        new Brackets((qb) => {
          qb.where('user.nom LIKE :term', { term: `${term}%` })
            .orWhere('user.prenom LIKE :term', { term: `${term}%` })
            .orWhere('user.activite LIKE :term', { term: `${term}%` });
        }),
      )
      .andWhere('user.email_verified_at IS NOT NULL');

    if (currentUserId) {
      query.andWhere('user.id != :currentUserId', { currentUserId });
    }

    return query
      .select(['user.id', 'user.nom', 'user.prenom', 'user.activite'])
      .limit(10)
      .getMany();
  }
}