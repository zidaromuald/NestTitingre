import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupeService } from './services/groupe.service';
import { GroupePolymorphicService } from './services/groupe-polymorphic.service';
import { GroupeController } from './controllers/groupe.controller';
import { GroupeRepository } from './repositories/groupe.repository';
import { GroupeMapper } from './mappers/groupe.mapper';
import { Groupe } from './entities/groupe.entity';
import { GroupeUser } from './entities/groupe-user.entity';
import { GroupeInvitation } from './entities/groupe-invitation.entity';
import { GroupeProfil } from './entities/groupe-profil.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Groupe,
      GroupeUser,
      GroupeInvitation,
      GroupeProfil,
      GroupeRepository,
      User,
      Societe,
      Post,
    ]),
  ],
  providers: [
    GroupeService,
    GroupePolymorphicService,
    GroupeRepository,
    GroupeMapper,
  ],
  controllers: [GroupeController],
  exports: [GroupeService, GroupePolymorphicService],
})
export class GroupesModule {}
