// common/interceptors/fastify-file.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

export interface FastifyFileInterceptorOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(
    private readonly fieldName: string = 'file',
    private readonly options?: FastifyFileInterceptorOptions,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    try {
      const data = await request.file();

      if (!data) {
        throw new BadRequestException('Aucun fichier fourni');
      }

      // Vérifier le type MIME si spécifié
      if (
        this.options?.allowedMimeTypes &&
        !this.options.allowedMimeTypes.includes(data.mimetype)
      ) {
        throw new BadRequestException(
          `Type de fichier non autorisé. Types acceptés: ${this.options.allowedMimeTypes.join(', ')}`,
        );
      }

      // Convertir le buffer en objet compatible avec Multer
      const buffer = await data.toBuffer();

      const file = {
        fieldname: data.fieldname,
        originalname: data.filename,
        encoding: data.encoding,
        mimetype: data.mimetype,
        buffer: buffer,
        size: buffer.length,
      };

      // Vérifier la taille si spécifiée
      if (this.options?.maxFileSize && file.size > this.options.maxFileSize) {
        throw new BadRequestException(
          `Fichier trop volumineux. Taille maximale: ${this.options.maxFileSize / (1024 * 1024)}MB`,
        );
      }

      // Ajouter le fichier à la requête
      (request as any).file = file;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors du traitement du fichier');
    }

    return next.handle();
  }
}

export function FastifyFileInterceptorFactory(
  fieldName: string = 'file',
  options?: FastifyFileInterceptorOptions,
) {
  return new FastifyFileInterceptor(fieldName, options);
}
