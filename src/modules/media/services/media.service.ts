// modules/media/services/media.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MediaType } from '../enums/media-type.enum';
import { UploadResponseDto } from '../dto/upload-response.dto';
import { saveFile, validateFile } from '../config/fastify-upload.config';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class MediaService {
  /**
   * Construit le chemin relatif du fichier uploadé
   */
  private buildFilePath(filename: string, type: MediaType): string {
    const typeFolder = `${type}s`; // image -> images, video -> videos, etc.
    return `uploads/${typeFolder}/${filename}`;
  }

  /**
   * Construit l'URL publique complète du fichier uploadé
   */
  private buildFileUrl(path: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/${path}`;
  }

  /**
   * Traite un fichier uploadé et retourne les informations
   */
  async handleUpload(
    file: UploadedFile,
    type: MediaType,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Valider le fichier
    validateFile(file.mimetype, file.size, type);

    // Sauvegarder le fichier sur le disque
    const filename = await saveFile(file.buffer, file.originalname, type);

    const path = this.buildFilePath(filename, type);
    const url = this.buildFileUrl(path);

    return {
      success: true,
      message: `${this.getTypeLabel(type)} uploadé(e) avec succès`,
      data: {
        path, // Chemin relatif à stocker en BDD
        url,  // URL complète pour affichage immédiat
        filename,
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
