import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PasswordResetService } from './services/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { SocietesModule } from '../societes/societes.module';
import { FirebaseAuthService } from './services/firebase-auth.service';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Societe]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        const expiresIn = configService.get<string>('jwt.expiresIn');

        // ✅ Validation supplémentaire
        if (!secret) {
          throw new Error('JWT_SECRET n\'est pas configuré');
        }

        return {
          secret,
          signOptions: {
            expiresIn: (expiresIn || '7d') as any,
          },
        };
      },
    }),
    UsersModule,
    SocietesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FirebaseAuthService, PasswordResetService],
  exports: [AuthService, JwtModule, PassportModule, FirebaseAuthService],
})
export class AuthModule {}