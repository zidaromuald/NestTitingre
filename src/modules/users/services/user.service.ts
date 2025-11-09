// modules/users/services/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { SearchUserDto } from '../dto/search-user.dto';
import { User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
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
}
