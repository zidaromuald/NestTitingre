// modules/media/services/media.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MediaType } from '../enums/media-type.enum';
import { UploadResponseDto } from '../dto/upload-response.dto';

@Injectable()
export class MediaService {
  /**
   * Construit l'URL publique du fichier uploadé
   */
  private buildFileUrl(filename: string, type: MediaType): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const typeFolder = `${type}s`; // image -> images, video -> videos, etc.
    return `${baseUrl}/uploads/${typeFolder}/${filename}`;
  }

  /**
   * Traite un fichier uploadé et retourne les informations
   */
  async handleUpload(
    file: Express.Multer.File,
    type: MediaType,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const fileUrl = this.buildFileUrl(file.filename, type);

    return {
      success: true,
      message: `${this.getTypeLabel(type)} uploadé(e) avec succès`,
      data: {
        url: fileUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        type,
      },
    };
  }

  /**
   * Retourne le label en français pour un type de média
   */
  private getTypeLabel(type: MediaType): string {
    const labels = {
      [MediaType.IMAGE]: 'Image',
      [MediaType.VIDEO]: 'Vidéo',
      [MediaType.AUDIO]: 'Audio',
      [MediaType.DOCUMENT]: 'Document',
    };
    return labels[type];
  }

  /**
   * TODO: Méthode pour upload vers AWS S3
   * À implémenter quand on migre vers S3
   */
  // async uploadToS3(file: Express.Multer.File): Promise<string> {
  //   // Logique S3 ici
  // }

  /**
   * TODO: Méthode pour upload vers Azure Blob Storage
   * À implémenter quand on migre vers Azure
   */
  // async uploadToAzure(file: Express.Multer.File): Promise<string> {
  //   // Logique Azure ici
  // }
}
