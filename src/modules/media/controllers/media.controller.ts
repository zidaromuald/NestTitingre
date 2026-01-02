// modules/media/controllers/media.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { MediaService } from '../services/media.service';
import { MediaType } from '../enums/media-type.enum';
import { getFastifyUploadOptions } from '../config/fastify-upload.config';
import { UploadResponseDto } from '../dto/upload-response.dto';
import { FastifyFileInterceptorFactory } from '../../../common/interceptors/fastify-file.interceptor';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload une image
   * POST /media/upload/image
   */
  // UTILISER AWS S3 POUR LE STOCKAGE DES MEDIAS OU CLOUDFLARE
  
  @Post('upload/image')
  @UseInterceptors(
    FastifyFileInterceptorFactory('file', getFastifyUploadOptions(MediaType.IMAGE)),
  )
  async uploadImage(@Req() request: FastifyRequest): Promise<UploadResponseDto> {
    const file = (request as any).file;
    return this.mediaService.handleUpload(file, MediaType.IMAGE);
  }

  /**
   * Upload une vidéo
   * POST /media/upload/video
   */
  @Post('upload/video')
  @UseInterceptors(
    FastifyFileInterceptorFactory('file', getFastifyUploadOptions(MediaType.VIDEO)),
  )
  async uploadVideo(@Req() request: FastifyRequest): Promise<UploadResponseDto> {
    const file = (request as any).file;
    return this.mediaService.handleUpload(file, MediaType.VIDEO);
  }

  /**
   * Upload un fichier audio
   * POST /media/upload/audio
   */
  @Post('upload/audio')
  @UseInterceptors(
    FastifyFileInterceptorFactory('file', getFastifyUploadOptions(MediaType.AUDIO)),
  )
  async uploadAudio(@Req() request: FastifyRequest): Promise<UploadResponseDto> {
    const file = (request as any).file;
    return this.mediaService.handleUpload(file, MediaType.AUDIO);
  }

  /**
   * Upload un document
   * POST /media/upload/document
   */
  @Post('upload/document')
  @UseInterceptors(
    FastifyFileInterceptorFactory('file', getFastifyUploadOptions(MediaType.DOCUMENT)),
  )
  async uploadDocument(@Req() request: FastifyRequest): Promise<UploadResponseDto> {
    const file = (request as any).file;
    return this.mediaService.handleUpload(file, MediaType.DOCUMENT);
  }
}
