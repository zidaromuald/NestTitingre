// modules/media/media.module.ts
import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService], // Export pour utilisation dans d'autres modules
})
export class MediaModule {}
