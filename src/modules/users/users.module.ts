// modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfil } from './entities/user-profil.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserMapper } from './mappers/user.mapper';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfil]),
    MediaModule, // Import pour utiliser MediaService
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService, UserMapper],
  exports: [
    TypeOrmModule, // Export TypeORM pour que d'autres modules puissent utiliser User et UserProfil
    UserService,
    UserRepository,
    UserMapper,
  ],
})
export class UsersModule {}