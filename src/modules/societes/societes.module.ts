// modules/societes/societes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Societe } from './entities/societe.entity';
import { SocieteRepository } from './repositories/societe.repository';
import { SocieteService } from './services/societe.service';
import { SocieteController } from './controllers/societe.controller';
import { SocieteMapper } from './mappers/societe.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Societe])],
  controllers: [SocieteController],
  providers: [SocieteRepository, SocieteService, SocieteMapper],
  exports: [SocieteService, SocieteRepository, SocieteMapper],
})
export class SocietesModule {}