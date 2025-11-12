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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],

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