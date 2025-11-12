// modules/media/config/multer.config.ts
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaType, MEDIA_TYPE_CONFIG } from '../enums/media-type.enum';

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
 * Configuration Multer pour un type de média spécifique
 */
export const getMulterOptions = (type: MediaType) => {
  const config = MEDIA_TYPE_CONFIG[type];

  return {
    storage: diskStorage({
      destination: config.destination,
      filename: (_req, file, callback) => {
        const filename = generateFileName(file.originalname, type);
        callback(null, filename);
      },
    }),
    fileFilter: (_req, file, callback) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `Type de fichier non autorisé. Formats acceptés: ${config.extensions.join(', ')}`,
          ),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: config.maxSize,
    },
  };
};
