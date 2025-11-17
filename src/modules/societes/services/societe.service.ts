// modules/societes/services/societe.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SocieteRepository } from '../repositories/societe.repository';
import { CreateSocieteDto } from '../dto/create-societe.dto';
import { SearchSocieteDto } from '../dto/search-societe.dto';
import { AdvancedSearchDto } from '../dto/advanced-search.dto';
import { UpdateSocieteProfilDto } from '../dto/update-societe-profil.dto';
import { Societe } from '../entities/societe.entity';
import { SocieteProfil } from '../entities/societe-profil.entity';
import { SocieteMapper } from '../mappers/societe.mapper';

@Injectable()
export class SocieteService {
  constructor(
    @InjectRepository(SocieteRepository)
    private readonly societeRepository: SocieteRepository,
    @InjectRepository(SocieteProfil)
    private readonly profilRepository: Repository<SocieteProfil>,
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

  // ==================== MÉTHODES DE PROFIL ====================

  /**
   * Récupérer le profil complet d'une société (Societe + SocieteProfil)
   */
  async getProfile(societeId: number): Promise<{
    societe: Societe;
    profile: SocieteProfil;
  }> {
    const societe = await this.societeRepository.findOne({
      where: { id: societeId },
      relations: ['profile'],
    });

    if (!societe) {
      throw new NotFoundException('Société introuvable');
    }

    // Si le profil n'existe pas, créer un profil vide
    if (!societe.profile) {
      societe.profile = await this.createEmptyProfile(societeId);
    }

    return {
      societe,
      profile: societe.profile,
    };
  }

  /**
   * Mettre à jour le profil de la société
   */
  async updateProfile(
    societeId: number,
    updateDto: UpdateSocieteProfilDto,
  ): Promise<SocieteProfil> {
    // Vérifier que la société existe
    await this.findById(societeId);

    // Chercher le profil existant
    let profil = await this.profilRepository.findOne({
      where: { societe_id: societeId },
    });

    if (!profil) {
      // Créer un nouveau profil
      const newProfil = new SocieteProfil();
      newProfil.societe_id = societeId;
      Object.assign(newProfil, updateDto);
      profil = newProfil;
    } else {
      // Mettre à jour le profil existant
      Object.assign(profil, updateDto);
    }

    return this.profilRepository.save(profil);
  }

  /**
   * Mettre à jour le logo de la société
   */
  async updateLogo(societeId: number, logoUrl: string): Promise<SocieteProfil> {
    return this.updateProfile(societeId, { logo: logoUrl });
  }

  /**
   * Récupérer les statistiques du profil société
   */
  async getProfileStats(societeId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    membresCount: number;
    groupesCount: number;
    profileCompletude: number;
  }> {
    console.log('🔍 getProfileStats appelé avec societeId:', societeId);

    const societe = await this.societeRepository.findOne({
      where: { id: societeId },
      relations: ['profile'],
    });

    console.log('🔍 Société trouvée:', societe ? {
      id: societe.id,
      nom_societe: societe.nom_societe,
      hasProfile: !!societe.profile,
    } : 'NULL');

    if (!societe) {
      throw new NotFoundException(`Société introuvable avec l'ID: ${societeId}`);
    }

    // TODO: Récupérer le nombre de posts via PostService
    const postsCount = 0; // await this.postService.countByAuthor(societeId, 'Societe');

    // TODO: Récupérer les suivis via SuiviService
    const followersCount = 0; // await this.suiviService.countFollowers(societeId, 'Societe');
    const followingCount = 0; // await this.suiviService.countFollowing(societeId, 'Societe');

    // Compter les membres de la société (relation many-to-many)
    const membresCountResult = await this.societeRepository.manager.query(
      `SELECT COUNT(*) as count FROM societe_users
       WHERE societe_id = $1`,
      [societeId],
    );

    // Compter les groupes créés par cette société (relation polymorphique)
    const groupesCountResult = await this.societeRepository.manager.query(
      `SELECT COUNT(*) as count FROM groupes
       WHERE created_by_id = $1 AND created_by_type = 'Societe'`,
      [societeId],
    );

    // Calculer le score de complétude du profil
    const profileCompletude = societe.profile
      ? societe.profile.getCompletudeScore()
      : 0;

    return {
      postsCount,
      followersCount,
      followingCount,
      membresCount: parseInt(membresCountResult[0]?.count || '0'),
      groupesCount: parseInt(groupesCountResult[0]?.count || '0'),
      profileCompletude,
    };
  }

  /**
   * Créer un profil vide pour une société
   */
  private async createEmptyProfile(societeId: number): Promise<SocieteProfil> {
    const profil = new SocieteProfil();
    profil.societe_id = societeId;
    profil.certifications = [];

    return this.profilRepository.save(profil);
  }
}