// modules/suivis/suivis.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuivreService } from './services/suivre.service';
import { SuivrePolymorphicService } from './services/suivre-polymorphic.service';
import { InvitationSuiviService } from './services/invitation-suivi.service';
import { DemandeAbonnementService } from './services/demande-abonnement.service';
import { AbonnementService } from './services/abonnement.service';
import { SuivreController } from './controllers/suivre.controller';
import { InvitationSuiviController } from './controllers/invitation-suivi.controller';
import { DemandeAbonnementController } from './controllers/demande-abonnement.controller';
import { AbonnementController } from './controllers/abonnement.controller';
import { SuivreRepository } from './repositories/suivre.repository';
import { InvitationSuiviRepository } from './repositories/invitation-suivi.repository';
import { DemandeAbonnementRepository } from './repositories/demande-abonnement.repository';
import { AbonnementRepository } from './repositories/abonnement.repository';
import { SuivreMapper } from './mappers/suivre.mapper';
import { InvitationSuiviMapper } from './mappers/invitation-suivi.mapper';
import { DemandeAbonnementMapper } from './mappers/demande-abonnement.mapper';
import { AbonnementMapper } from './mappers/abonnement.mapper';
import { Suivre } from './entities/suivre.entity';
import { InvitationSuivi } from './entities/invitation-suivi.entity';
import { DemandeAbonnement } from './entities/demande-abonnement.entity';
import { Abonnement } from './entities/abonnement.entity';
import { UsersModule } from '../users/users.module';
import { SocietesModule } from '../societes/societes.module';
import { PartenariatsModule } from '../partenariats/partenariats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvitationSuivi,
      Suivre,
      DemandeAbonnement,
      Abonnement,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => SocietesModule),
    forwardRef(() => PartenariatsModule),
  ],
  providers: [
    InvitationSuiviService,
    SuivreService,
    SuivrePolymorphicService,
    DemandeAbonnementService,
    AbonnementService,
    InvitationSuiviRepository,
    SuivreRepository,
    DemandeAbonnementRepository,
    AbonnementRepository,
    InvitationSuiviMapper,
    SuivreMapper,
    DemandeAbonnementMapper,
    AbonnementMapper,
  ],
  controllers: [InvitationSuiviController, SuivreController, DemandeAbonnementController, AbonnementController],
  exports: [
    InvitationSuiviService,
    SuivreService,
    SuivrePolymorphicService,
    DemandeAbonnementService,
    AbonnementService,
    InvitationSuiviRepository,
    SuivreRepository,
    DemandeAbonnementRepository,
    AbonnementRepository,
    InvitationSuiviMapper,
    SuivreMapper,
    DemandeAbonnementMapper,
    AbonnementMapper,
  ],
})
export class SuivisModule {}
