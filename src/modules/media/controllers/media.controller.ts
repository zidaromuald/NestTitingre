// modules/media/controllers/media.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../services/media.service';
import { MediaType } from '../enums/media-type.enum';
import { getMulterOptions } from '../config/multer.config';
import { UploadResponseDto } from '../dto/upload-response.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload une image
   * POST /media/upload/image
   */
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file', getMulterOptions(MediaType.IMAGE)))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.mediaService.handleUpload(file, MediaType.IMAGE);
  }

  /**
   * Upload une vidéo
   * POST /media/upload/video
   */
  @Post('upload/video')
  @UseInterceptors(FileInterceptor('file', getMulterOptions(MediaType.VIDEO)))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.mediaService.handleUpload(file, MediaType.VIDEO);
  }

  /**
   * Upload un fichier audio
   * POST /media/upload/audio
   */
  @Post('upload/audio')
  @UseInterceptors(FileInterceptor('file', getMulterOptions(MediaType.AUDIO)))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.mediaService.handleUpload(file, MediaType.AUDIO);
  }

  /**
   * Upload un document
   * POST /media/upload/document
   */
  @Post('upload/document')
  @UseInterceptors(
    FileInterceptor('file', getMulterOptions(MediaType.DOCUMENT)),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.mediaService.handleUpload(file, MediaType.DOCUMENT);
  }
}
