import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupeService } from './services/groupe.service';
import { GroupePolymorphicService } from './services/groupe-polymorphic.service';
import { MessageGroupeService } from './services/message-groupe.service';
import { GroupeController } from './controllers/groupe.controller';
import { GroupeMembreController } from './controllers/groupe-membre.controller';
import { GroupeInvitationController } from './controllers/groupe-invitation.controller';
import { GroupeProfilController } from './controllers/groupe-profil.controller';
import { GroupeMessageController } from './controllers/groupe-message.controller';
import { GroupeRepository } from './repositories/groupe.repository';
import { MessageGroupeRepository } from './repositories/message-groupe.repository';
import { GroupeMapper } from './mappers/groupe.mapper';
import { MessageGroupeMapper } from './mappers/message-groupe.mapper';
import { Groupe } from './entities/groupe.entity';
import { GroupeUser } from './entities/groupe-user.entity';
import { GroupeInvitation } from './entities/groupe-invitation.entity';
import { GroupeProfil } from './entities/groupe-profil.entity';
import { MessageGroupe } from './entities/message-groupe.entity';
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
      MessageGroupe,
      GroupeRepository,
      User,
      Societe,
      Post,
    ]),
  ],
  providers: [
    GroupeService,
    GroupePolymorphicService,
    MessageGroupeService,
    GroupeRepository,
    MessageGroupeRepository,
    GroupeMapper,
    MessageGroupeMapper,
  ],
  controllers: [
    GroupeController,
    GroupeMembreController,
    GroupeInvitationController,
    GroupeProfilController,
    GroupeMessageController,
  ],
  exports: [GroupeService, GroupePolymorphicService, MessageGroupeService],
})
export class GroupesModule {}
