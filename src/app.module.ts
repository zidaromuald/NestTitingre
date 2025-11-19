// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SocietesModule } from './modules/societes/societes.module';
import { CacheModule } from './modules/cache/cache.module';
import { GroupesModule } from './modules/groupes/groupes.module';
import { PostsModule } from './modules/posts/posts.module';
import { SuivisModule } from './modules/suivis/suivis.module';
import { PartenariatsModule } from './modules/partenariats/partenariats.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MediaModule } from './modules/media/media.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Import all entities explicitly to avoid glob pattern issues
import { User } from './modules/users/entities/user.entity';
import { UserProfil } from './modules/users/entities/user-profil.entity';
import { Societe } from './modules/societes/entities/societe.entity';
import { SocieteProfil } from './modules/societes/entities/societe-profil.entity';
import { SocieteUser } from './modules/societes/entities/societe-user.entity';
import { Groupe } from './modules/groupes/entities/groupe.entity';
import { GroupeProfil } from './modules/groupes/entities/groupe-profil.entity';
import { GroupeUser } from './modules/groupes/entities/groupe-user.entity';
import { GroupeInvitation } from './modules/groupes/entities/groupe-invitation.entity';
import { Post } from './modules/posts/entities/post.entity';
import { Like } from './modules/posts/entities/like.entity';
import { Commentaire } from './modules/posts/entities/commentaire.entity';
import { Suivre } from './modules/suivis/entities/suivre.entity';
import { InvitationSuivi } from './modules/suivis/entities/invitation-suivi.entity';
import { DemandeAbonnement } from './modules/suivis/entities/demande-abonnement.entity';
import { Abonnement } from './modules/suivis/entities/abonnement.entity';
import { PagePartenariat } from './modules/partenariats/entities/page-partenariat.entity';
import { TransactionPartenariat } from './modules/partenariats/entities/transaction-partenariat.entity';
import { InformationPartenaire } from './modules/partenariats/entities/information-partenaire.entity';
import { Conversation } from './modules/messages/entities/conversation.entity';
import { MessageCollaboration } from './modules/messages/entities/message-collaboration.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { NotificationPreference } from './modules/notifications/entities/notification-preference.entity';
import { TransactionCollaboration } from './modules/transactions/entities/transaction-collaboration.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        // Explicitly list all entities instead of using glob pattern
        entities: [
          User,
          UserProfil,
          Societe,
          SocieteProfil,
          SocieteUser,
          Groupe,
          GroupeProfil,
          GroupeUser,
          GroupeInvitation,
          Post,
          Like,
          Commentaire,
          Suivre,
          InvitationSuivi,
          DemandeAbonnement,
          Abonnement,
          PagePartenariat,
          TransactionPartenariat,
          InformationPartenaire,
          Conversation,
          MessageCollaboration,
          Notification,
          NotificationPreference,
          TransactionCollaboration,
        ],

        // Mode migrations activé
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true, // Exécute automatiquement les migrations au démarrage
        migrationsTableName: 'migrations',
      }),
    }),
    CacheModule,
    AuthModule,
    UsersModule,
    SocietesModule,
    GroupesModule,
    PostsModule,
    MediaModule,
    SuivisModule,
    PartenariatsModule,
    MessagesModule,
    NotificationsModule,
    TransactionsModule,
  ],
})
export class AppModule {}