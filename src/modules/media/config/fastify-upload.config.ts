// modules/media/config/fastify-upload.config.ts
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { MediaType, MEDIA_TYPE_CONFIG } from '../enums/media-type.enum';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Génère un nom de fichier unique
 */
export const generateFileName = (
  originalname: string,
  type: MediaType,
): string => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(originalname);
  return `${type}-${uniqueSuffix}${ext}`;
};

/**
 * Sauvegarde un fichier sur le disque et retourne le chemin
 */
export async function saveFile(
  buffer: Buffer,
  originalname: string,
  type: MediaType,
): Promise<string> {
  const config = MEDIA_TYPE_CONFIG[type];
  const filename = generateFileName(originalname, type);
  const filepath = join(config.destination, filename);

  // Créer le dossier s'il n'existe pas
  await fs.mkdir(config.destination, { recursive: true });

  // Sauvegarder le fichier
  await fs.writeFile(filepath, buffer);

  return filename;
}

/**
 * Valide un fichier selon le type média
 */
export function validateFile(
  mimetype: string,
  size: number,
  type: MediaType,
): void {
  const config = MEDIA_TYPE_CONFIG[type];

  // Vérifier le type MIME
  if (!config.allowedMimeTypes.includes(mimetype)) {
    throw new BadRequestException(
      `Type de fichier non autorisé. Formats acceptés: ${config.extensions.join(', ')}`,
    );
  }

  // Vérifier la taille
  if (size > config.maxSize) {
    throw new BadRequestException(
      `Fichier trop volumineux. Taille maximale: ${config.maxSize / (1024 * 1024)}MB`,
    );
  }
}

/**
 * Options pour l'upload Fastify selon le type de média
 */
export function getFastifyUploadOptions(type: MediaType) {
  const config = MEDIA_TYPE_CONFIG[type];

  return {
    allowedMimeTypes: config.allowedMimeTypes,
    maxFileSize: config.maxSize,
  };
}
