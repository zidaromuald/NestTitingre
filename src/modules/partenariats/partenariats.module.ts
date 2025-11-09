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
import { TransactionPartenaritService } from './services/transaction-partenariat.service';
import { InformationPartenaireService } from './services/information-partenaire.service';
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
    TransactionPartenaritService,
    InformationPartenaireService,
  ],
  controllers: [
    TransactionPartenaritController,
    InformationPartenaireController,
  ],
  exports: [
    // Repositories
    PagePartenaritRepository,
    TransactionPartenaritRepository,
    InformationPartenaireRepository,
    // Mappers
    PagePartenaritMapper,
    TransactionPartenaritMapper,
    InformationPartenaireMapper,
    // Services
    TransactionPartenaritService,
    InformationPartenaireService,
  ],
})
export class PartenariatsModule {}
