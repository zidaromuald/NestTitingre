// modules/societes/repositories/societe.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Brackets } from 'typeorm';
import { Societe } from '../entities/societe.entity';
import { SearchSocieteDto } from '../dto/search-societe.dto';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';

@Injectable()
export class SocieteRepository extends Repository<Societe> {
  constructor(private dataSource: DataSource) {
    super(Societe, dataSource.createEntityManager());
  }

  async findByIdentifier(identifier: string): Promise<Societe | null> {
    const isEmail = identifier.includes('@');
    
    return this.findOne({
      where: isEmail ? { email: identifier } : { numero: identifier },
    });
  }

  async searchSocietes(
    searchDto: SearchSocieteDto,
  ): Promise<[Societe[], number]> {
    const {
      nomSociete,
      secteurActivite,
      typeProduit,
      centreInteret,
      adresse,
      verifiedOnly,
      sortBy,
      sortOrder,
      page,
      perPage,
    } = searchDto;

    const query = this.createQueryBuilder('societe');

    // Filtres de recherche
    if (nomSociete) {
      query.andWhere('societe.nom_societe LIKE :nom_societe', {
        nom_societe: `%${nomSociete}%`,
      });
    }

    // Recherche exacte pour optimiser l'utilisation des index
    if (secteurActivite) {
      query.andWhere('societe.secteur_activite = :secteurActivite', {
        secteurActivite,
      });
    }

    if (typeProduit) {
      query.andWhere('societe.type_produit LIKE :typeProduit', {
        typeProduit: `%${typeProduit}%`,
      });
    }

    if (centreInteret) {
      query.andWhere('societe.centre_interet LIKE :centreInteret', {
        centreInteret: `%${centreInteret}%`,
      });
    }

    if (adresse) {
      query.andWhere('societe.adresse LIKE :adresse', {
        adresse: `%${adresse}%`,
      });
    }

    // Filtre sociétés vérifiées
    if (verifiedOnly) {
      query.andWhere('societe.email_verified_at IS NOT NULL');
    }

    // Sélection des colonnes
    query.select([
      'societe.id',
      'societe.nom_societe',
      'societe.email',
      'societe.numero',
      'societe.secteur_activite',
      'societe.type_produit',
      'societe.centre_interet',
      'societe.adresse',
      'societe.email_verified_at',
      'societe.created_at',
    ]);

    // Tri
    const sortField = sortBy || 'created_at';
    const sortDirection = (sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    query.orderBy(`societe.${sortField}`, sortDirection);

    // Pagination
    const currentPage = page || 1;
    const itemsPerPage = perPage || 10;
    const skip = (currentPage - 1) * itemsPerPage;
    query.skip(skip).take(itemsPerPage);

    return query.getManyAndCount();
  }

  async searchByName(q: string): Promise<Societe[]> {
    return this.createQueryBuilder('societe')
      .where('societe.nom_societe LIKE :q', { q: `${q}%` })
      .andWhere('societe.email_verified_at IS NOT NULL')
      .select([
        'societe.id',
        'societe.nom_societe',
        'societe.secteur_activite',
        'societe.adresse',
      ])
      .limit(20)
      .getMany();
  }

  async advancedSearch(
    searchDto: AdvancedSearchDto,
  ): Promise<[Societe[], number]> {
    const { secteur, produit, interet, ville, verifiedOnly, page, perPage } =
      searchDto;

    const query = this.createQueryBuilder('societe');

    // Utilisation optimisée des index composés
    if (secteur && produit) {
      // Utilise l'index composé ['secteur_activite', 'type_produit']
      query
        .where('societe.secteur_activite = :secteur', { secteur })
        .andWhere('societe.type_produit LIKE :produit', {
          produit: `%${produit}%`,
        });
    } else {
      // Utilise les index simples
      if (secteur) {
        query.where('societe.secteur_activite = :secteur', { secteur });
      }
      if (produit) {
        query.andWhere('societe.type_produit LIKE :produit', {
          produit: `%${produit}%`,
        });
      }
    }

    if (interet) {
      query.andWhere('societe.centre_interet LIKE :interet', {
        interet: `%${interet}%`,
      });
    }

    if (ville) {
      query.andWhere('societe.adresse LIKE :ville', {
        ville: `%${ville}%`,
      });
    }

    if (verifiedOnly) {
      query.andWhere('societe.email_verified_at IS NOT NULL');
    }

    // Tri optimisé avec index composé
    query
      .orderBy('societe.secteur_activite', 'ASC')
      .addOrderBy('societe.created_at', 'DESC');

    // Pagination
    const currentPage = page || 1;
    const itemsPerPage = perPage || 10;
    const skip = (currentPage - 1) * itemsPerPage;
    query.skip(skip).take(itemsPerPage);

    return query.getManyAndCount();
  }

  async autocomplete(term: string): Promise<Societe[]> {
    return this.createQueryBuilder('societe')
      .where(
        new Brackets((qb) => {
          qb.where('societe.nom_societe LIKE :term', { term: `${term}%` })
            .orWhere('societe.secteur_activite LIKE :term', {
              term: `${term}%`,
            })
            .orWhere('societe.type_produit LIKE :term', { term: `${term}%` });
        }),
      )
      .andWhere('societe.email_verified_at IS NOT NULL')
      .select([
        'societe.id',
        'societe.nom_societe',
        'societe.secteur_activite',
        'societe.type_produit',
      ])
      .limit(10)
      .getMany();
  }

  async getDistinctSecteurs(): Promise<string[]> {
    const result = await this.createQueryBuilder('societe')
      .select('DISTINCT societe.secteur_activite', 'secteur_activite')
      .where('societe.email_verified_at IS NOT NULL')
      .andWhere('societe.secteur_activite IS NOT NULL')
      .orderBy('societe.secteur_activite', 'ASC')
      .getRawMany();

    return result.map((r) => r.secteur_activite).filter(Boolean);
  }

  async getDistinctProduits(): Promise<string[]> {
    const result = await this.createQueryBuilder('societe')
      .select('DISTINCT societe.type_produit', 'type_produit')
      .where('societe.email_verified_at IS NOT NULL')
      .andWhere('societe.type_produit IS NOT NULL')
      .orderBy('societe.type_produit', 'ASC')
      .getRawMany();

    return result.map((r) => r.type_produit).filter(Boolean);
  }

  async getDistinctInterets(): Promise<string[]> {
    const result = await this.createQueryBuilder('societe')
      .select('DISTINCT societe.centre_interet', 'centre_interet')
      .where('societe.email_verified_at IS NOT NULL')
      .andWhere('societe.centre_interet IS NOT NULL')
      .orderBy('societe.centre_interet', 'ASC')
      .getRawMany();

    return result.map((r) => r.centre_interet).filter(Boolean);
  }
}
