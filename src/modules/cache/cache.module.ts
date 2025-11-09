// modules/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 3600, // 1 heure par défaut
      max: 100, // Maximum 100 items en cache
      isGlobal: true,
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}