// modules/suivis/suivis.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuivreService } from './services/suivre.service';
import { SuivrePolymorphicService } from './services/suivre-polymorphic.service';
import { InvitationSuiviService } from './services/invitation-suivi.service';
import { DemandeAbonnementService } from './services/demande-abonnement.service';
import { SuivreController } from './controllers/suivre.controller';
import { InvitationSuiviController } from './controllers/invitation-suivi.controller';
import { DemandeAbonnementController } from './controllers/demande-abonnement.controller';
import { SuivreRepository } from './repositories/suivre.repository';
import { InvitationSuiviRepository } from './repositories/invitation-suivi.repository';
import { DemandeAbonnementRepository } from './repositories/demande-abonnement.repository';
import { SuivreMapper } from './mappers/suivre.mapper';
import { InvitationSuiviMapper } from './mappers/invitation-suivi.mapper';
import { DemandeAbonnementMapper } from './mappers/demande-abonnement.mapper';
import { Suivre } from './entities/suivre.entity';
import { InvitationSuivi } from './entities/invitation-suivi.entity';
import { DemandeAbonnement } from './entities/demande-abonnement.entity';
import { Abonnement } from './entities/abonnement.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { PagePartenariat } from '../partenariats/entities/page-partenariat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvitationSuivi,
      Suivre,
      DemandeAbonnement,
      Abonnement,
      User,
      Societe,
      PagePartenariat,
      InvitationSuiviRepository,
      SuivreRepository,
      DemandeAbonnementRepository,
    ]),
  ],
  providers: [
    InvitationSuiviService,
    SuivreService,
    SuivrePolymorphicService,
    DemandeAbonnementService,
    InvitationSuiviRepository,
    SuivreRepository,
    DemandeAbonnementRepository,
    InvitationSuiviMapper,
    SuivreMapper,
    DemandeAbonnementMapper,
  ],
  controllers: [InvitationSuiviController, SuivreController, DemandeAbonnementController],
  exports: [
    InvitationSuiviService,
    SuivreService,
    SuivrePolymorphicService,
    DemandeAbonnementService,
    InvitationSuiviRepository,
    SuivreRepository,
    DemandeAbonnementRepository,
    InvitationSuiviMapper,
    SuivreMapper,
    DemandeAbonnementMapper,
  ],
})
export class SuivisModule {}
