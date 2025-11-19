// modules/societes/societes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Societe } from './entities/societe.entity';
import { SocieteProfil } from './entities/societe-profil.entity';
import { SocieteRepository } from './repositories/societe.repository';
import { SocieteService } from './services/societe.service';
import { SocieteController } from './controllers/societe.controller';
import { SocieteMapper } from './mappers/societe.mapper';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Societe, SocieteProfil]),
    MediaModule, // Import pour utiliser MediaService
  ],
  controllers: [SocieteController],
  providers: [SocieteRepository, SocieteService, SocieteMapper],
  exports: [
    TypeOrmModule, // Export TypeORM pour que d'autres modules puissent utiliser Societe et SocieteProfil
    SocieteService,
    SocieteRepository,
    SocieteMapper,
  ],
})
export class SocietesModule {}