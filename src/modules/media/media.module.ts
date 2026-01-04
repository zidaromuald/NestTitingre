// modules/media/media.module.ts
import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { CloudflareR2Module } from '../../cloudflare-r2/cloudflare-r2.module';

@Module({
  imports: [
    CloudflareR2Module,   // Import CloudflareR2Module pour utiliser CloudflareR2Service
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService], // Export pour utilisation dans d'autres modules
})
export class MediaModule {}
