// modules/users/services/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { SearchUserDto } from '../dto/search-user.dto';
import { UpdateUserProfilDto } from '../dto/update-user-profil.dto';
import { User } from '../entities/user.entity';
import { UserProfil } from '../entities/user-profil.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(UserProfil)
    private readonly profilRepository: Repository<UserProfil>,
    private readonly userMapper: UserMapper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, password_confirmation, ...userData } = createUserDto;

    // Vérifier que les mots de passe correspondent
    if (password !== password_confirmation) {
      throw new ConflictException('Les mots de passe ne correspondent pas');
    }

    // Vérifier si le numéro existe déjà
    const existingByNumero = await this.userRepository.findOne({
      where: { numero: userData.numero },
    });
    
    if (existingByNumero) {
      throw new ConflictException('Ce numéro est déjà utilisé');
    }

    // Vérifier si l'email existe déjà (si fourni)
    if (userData.email) {
      const existingByEmail = await this.userRepository.findOne({
        where: { email: userData.email },
      });
      
      if (existingByEmail) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    return user;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findByIdentifier(identifier);
  }

  async search(searchDto: SearchUserDto, currentUserId?: number) {
  const [users, total] = await this.userRepository.searchUsers(
    searchDto,
    currentUserId,
  );

  const totalPages = Math.ceil(total / searchDto.perPage);

  return {
    data: users.map((user) => this.userMapper.toPublicData(user, true)),
    meta: {
      total,
      page: searchDto.page,
      perPage: searchDto.perPage,
      totalPages,
    },
    filters_applied: {
      nom: searchDto.nom,
      prenom: searchDto.prenom,
      activite: searchDto.activite,
      ageMin: searchDto.ageMin,
      ageMax: searchDto.ageMax,
      emailVerified: searchDto.emailVerified,
    },
  };
}

  async autocomplete(term: string, currentUserId?: number) {
    const users = await this.userRepository.autocomplete(term, currentUserId);
    return users.map((user) => this.userMapper.toAutocompleteData(user));
  }

  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user = await this.findByIdentifier(identifier);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  // ==================== MÉTHODES DE PROFIL ====================

  /**
   * Récupérer le profil complet d'un utilisateur (User + UserProfil)
   */
  async getProfile(userId: number): Promise<{
    user: User;
    profile: UserProfil;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Si le profil n'existe pas, créer un profil vide
    if (!user.profile) {
      user.profile = await this.createEmptyProfile(userId);
    }

    return {
      user,
      profile: user.profile,
    };
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(
    userId: number,
    updateDto: UpdateUserProfilDto,
  ): Promise<UserProfil> {
    // Vérifier que l'utilisateur existe
    await this.findById(userId);

    // Chercher le profil existant
    let profil = await this.profilRepository.findOne({
      where: { user_id: userId },
    });

    if (!profil) {
      // Créer un nouveau profil
      const newProfil = new UserProfil();
      newProfil.user_id = userId;
      Object.assign(newProfil, updateDto);
      profil = newProfil;
    } else {
      // Mettre à jour le profil existant
      Object.assign(profil, updateDto);
    }

    return this.profilRepository.save(profil);
  }

  /**
   * Mettre à jour la photo de profil
   */
  async updateProfilePhoto(userId: number, photoUrl: string): Promise<UserProfil> {
    return this.updateProfile(userId, { photo: photoUrl });
  }

  /**
   * Récupérer les statistiques du profil
   */
  async getProfileStats(userId: number): Promise<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
    groupesCount: number;
    societesCount: number;
    profileCompletude: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // TODO: Récupérer le nombre de posts via PostService
    const postsCount = 0; // await this.postService.countByAuthor(userId, 'User');

    // TODO: Récupérer les suivis via SuiviService
    const followersCount = 0; // await this.suiviService.countFollowers(userId, 'User');
    const followingCount = 0; // await this.suiviService.countFollowing(userId, 'User');

    // Compter les groupes dont l'utilisateur est membre
    // La relation est polymorphique, on doit compter manuellement
    const groupesCount = await this.userRepository.manager.query(
      `SELECT COUNT(*) as count FROM groupe_users
       WHERE member_id = $1 AND member_type = 'User'`,
      [userId],
    );

    // Compter les sociétés dont l'utilisateur est membre
    const societesCount = await this.userRepository.manager.query(
      `SELECT COUNT(*) as count FROM societe_users
       WHERE user_id = $1`,
      [userId],
    );

    // Calculer le score de complétude du profil
    const profileCompletude = user.profile
      ? user.profile.getCompletudeScore()
      : 0;

    return {
      postsCount,
      followersCount,
      followingCount,
      groupesCount: parseInt(groupesCount[0]?.count || '0'),
      societesCount: parseInt(societesCount[0]?.count || '0'),
      profileCompletude,
    };
  }

  /**
   * Créer un profil vide pour un utilisateur
   */
  private async createEmptyProfile(userId: number): Promise<UserProfil> {
    const profil = new UserProfil();
    profil.user_id = userId;

    return this.profilRepository.save(profil);
  }
}
