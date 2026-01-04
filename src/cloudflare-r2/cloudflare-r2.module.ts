// cloudflare-r2/cloudflare-r2.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudflareR2Provider } from './cloudflare-r2.provider';
import { CloudflareR2Service } from './cloudflare-r2.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudflareR2Provider, CloudflareR2Service],
  exports: [CloudflareR2Provider, CloudflareR2Service],
})
export class CloudflareR2Module {}
