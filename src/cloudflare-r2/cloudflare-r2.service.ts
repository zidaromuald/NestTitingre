// cloudflare-r2/cloudflare-r2.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import { MediaType } from '../modules/media/enums/media-type.enum';

interface R2UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

@Injectable()
export class CloudflareR2Service {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;
  private accountId: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID') || '';
    this.bucketName = this.configService.get<string>('CLOUDFLARE_R2_BUCKET_NAME') || 'titingre-media';
    this.publicUrl = this.configService.get<string>('CLOUDFLARE_R2_PUBLIC_URL') || '';

    const accessKeyId = this.configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') || '';

    // Configuration du client S3 pour Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Génère le chemin de fichier dans R2 selon le type de média
   */
  private generateKey(filename: string, type: MediaType): string {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = filename.substring(filename.lastIndexOf('.'));
    const typeFolder = `${type}s`; // image -> images, video -> videos

    return `${typeFolder}/${type}-${timestamp}-${random}${extension}`;
  }

  /**
   * Construit l'URL publique du fichier
   */
  private buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      // Si vous avez configuré un domaine personnalisé
      return `${this.publicUrl}/${key}`;
    }
    // Sinon, utiliser l'URL R2 par défaut
    return `https://pub-${this.accountId}.r2.dev/${key}`;
  }

  /**
   * Détermine le Content-Type basé sur le type de média
   */
  private getContentType(mimetype: string): string {
    return mimetype;
  }

  /**
   * Upload un fichier vers Cloudflare R2
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    type: MediaType,
  ): Promise<R2UploadResult> {
    try {
      const key = this.generateKey(filename, type);

      // Upload multipart pour les gros fichiers
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: this.getContentType(mimetype),
          // Metadata personnalisée
          Metadata: {
            originalName: filename,
            mediaType: type,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      await upload.done();

      return {
        url: this.buildPublicUrl(key),
        key: key,
        bucket: this.bucketName,
        size: buffer.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de l'upload vers Cloudflare R2: ${error.message}`,
      );
    }
  }

  /**
   * Supprime un fichier de Cloudflare R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la suppression du fichier: ${error.message}`,
      );
    }
  }

  /**
   * Récupère un fichier depuis Cloudflare R2
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la récupération du fichier: ${error.message}`,
      );
    }
  }

  /**
   * Vérifie si un fichier existe dans R2
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Génère une URL signée temporaire (pour fichiers privés)
   * Note: R2 ne supporte pas encore les presigned URLs via SDK
   * Utilisez Cloudflare Workers pour cette fonctionnalité
   */
  generateSignedUrl(key: string, expiresIn: number = 3600): string {
    // Pour l'instant, retourne l'URL publique
    // Implémentez avec Cloudflare Workers si vous avez besoin d'URLs signées
    return this.buildPublicUrl(key);
  }
}
