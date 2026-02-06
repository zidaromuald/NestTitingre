// modules/partenariats/partenariats.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagePartenariat } from './entities/page-partenariat.entity';
import { TransactionPartenariat } from './entities/transaction-partenariat.entity';
import { InformationPartenaire } from './entities/information-partenaire.entity';
import { Abonnement } from '../suivis/entities/abonnement.entity';
import { PagePartenaritRepository } from './repositories/page-partenariat.repository';
import { TransactionPartenaritRepository } from './repositories/transaction-partenariat.repository';
import { InformationPartenaireRepository } from './repositories/information-partenaire.repository';
import { PagePartenaritMapper } from './mappers/page-partenariat.mapper';
import { TransactionPartenaritMapper } from './mappers/transaction-partenariat.mapper';
import { InformationPartenaireMapper } from './mappers/information-partenaire.mapper';
import { PagePartenaritService } from './services/page-partenariat.service';
import { TransactionPartenaritService } from './services/transaction-partenariat.service';
import { InformationPartenaireService } from './services/information-partenaire.service';
import { PagePartenaritController } from './controllers/page-partenariat.controller';
import { TransactionPartenaritController } from './controllers/transaction-partenariat.controller';
import { InformationPartenaireController } from './controllers/information-partenaire.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PagePartenariat,
      TransactionPartenariat,
      InformationPartenaire,
      Abonnement,
    ]),
  ],
  providers: [
    // Repositories
    PagePartenaritRepository,
    TransactionPartenaritRepository,
    InformationPartenaireRepository,
    // Mappers
    PagePartenaritMapper,
    TransactionPartenaritMapper,
    InformationPartenaireMapper,
    // Services
    PagePartenaritService,
    TransactionPartenaritService,
    InformationPartenaireService,
  ],
  controllers: [
    PagePartenaritController,
    TransactionPartenaritController,
    InformationPartenaireController,
  ],
  exports: [
    TypeOrmModule, // Export TypeORM pour que d'autres modules puissent utiliser PagePartenariat, TransactionPartenariat, etc.
    // Repositories
    PagePartenaritRepository,
    TransactionPartenaritRepository,
    InformationPartenaireRepository,
    // Mappers
    PagePartenaritMapper,
    TransactionPartenaritMapper,
    InformationPartenaireMapper,
    // Services
    PagePartenaritService,
    TransactionPartenaritService,
    InformationPartenaireService,
  ],
})
export class PartenariatsModule {}
