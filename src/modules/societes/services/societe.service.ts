// modules/societes/services/societe.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SocieteRepository } from '../repositories/societe.repository';
import { CreateSocieteDto } from '../dto/create-societe.dto';
import { SearchSocieteDto } from '../dto/search-societe.dto';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { Societe } from '../entities/societe.entity';
import { SocieteMapper } from '../mappers/societe.mapper';

@Injectable()
export class SocieteService {
  constructor(
    @InjectRepository(SocieteRepository)
    private readonly societeRepository: SocieteRepository,
    private readonly societeMapper: SocieteMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createSocieteDto: CreateSocieteDto): Promise<Societe> {
    const { password, password_confirmation, ...societeData } =
      createSocieteDto;

    // Vérifier que les mots de passe correspondent
    if (password !== password_confirmation) {
      throw new ConflictException('Les mots de passe ne correspondent pas');
    }

    // Vérifier si le numéro existe déjà
    const existingByNumero = await this.societeRepository.findOne({
      where: { numero: societeData.numero },
    });

    if (existingByNumero) {
      throw new ConflictException('Ce numéro est déjà utilisé');
    }

    // Vérifier si l'email existe déjà
    const existingByEmail = await this.societeRepository.findOne({
      where: { email: societeData.email },
    });

    if (existingByEmail) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer la société
    const societe = this.societeRepository.create({
      ...societeData,
      password: hashedPassword,
    });

    return this.societeRepository.save(societe);
  }

  async findById(id: number): Promise<Societe> {
    const societe = await this.societeRepository.findOne({ where: { id } });

    if (!societe) {
      throw new NotFoundException('Société non trouvée');
    }

    return societe;
  }

  async findByIdentifier(identifier: string): Promise<Societe | null> {
    return this.societeRepository.findByIdentifier(identifier);
  }

  async search(searchDto: SearchSocieteDto) {
  const [societes, total] = await this.societeRepository.searchSocietes(
    searchDto,
  );

  const perPage = searchDto.perPage || 10;
  const totalPages = Math.ceil(total / perPage);

  return {
    data: societes.map((societe) =>
      this.societeMapper.toPublicData(societe),
    ),
    meta: {
      total,
      page: searchDto.page,
      perPage: searchDto.perPage,
      totalPages,
    },
    filters_applied: {
      societe: searchDto.nomSociete,
      secteurActivite: searchDto.secteurActivite,
      typeProduit: searchDto.typeProduit,
      centreInteret: searchDto.centreInteret,
      adresse: searchDto.adresse,
      verifiedOnly: searchDto.verifiedOnly,
    },
  };
  }

  async searchByName(q: string) {
    const societes = await this.societeRepository.searchByName(q);
    return societes.map((societe) =>
      this.societeMapper.toSearchByNameData(societe),
    );
  }

async advancedSearch(searchDto: AdvancedSearchDto) {
  const [societes, total] = await this.societeRepository.advancedSearch(
    searchDto,
  );

  const perPage = searchDto.perPage || 10;
  const totalPages = Math.ceil(total / perPage);

  return {
    data: societes.map((societe) =>
      this.societeMapper.toPublicData(societe),
    ),
    meta: {
      total,
      page: searchDto.page,
      perPage: searchDto.perPage,
      totalPages,
    },
  };
  }

  async autocomplete(term: string) {
    const societes = await this.societeRepository.autocomplete(term);
    return societes.map((societe) =>
      this.societeMapper.toAutocompleteData(societe),
    );
  }

  async getFilters() {
    // Utilisation du cache avec TTL de 1 heure (3600 secondes)
    const cacheKey = 'societes_filters';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const [secteurs, produits, interets] = await Promise.all([
      this.societeRepository.getDistinctSecteurs(),
      this.societeRepository.getDistinctProduits(),
      this.societeRepository.getDistinctInterets(),
    ]);

    const filters = {
      secteurs,
      produits,
      interets,
    };

    // Mettre en cache pour 1 heure
    await this.cacheManager.set(cacheKey, filters, 3600);

    return filters;
  }

  async validateSociete(
    identifier: string,
    password: string,
  ): Promise<Societe | null> {
    const societe = await this.findByIdentifier(identifier);

    if (societe && (await bcrypt.compare(password, societe.password))) {
      return societe;
    }

    return null;
  }
}