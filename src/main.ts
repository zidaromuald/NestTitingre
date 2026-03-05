import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { join } from 'path';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: !isProduction, // Logs uniquement en développement
      trustProxy: isProduction, // Important pour production derrière un proxy/load balancer
    }),
  );

  // Servir les fichiers statiques uploadés si le storage est local (dev ET prod sans R2)
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  if (storageProvider !== 'r2') {
    await app.register(fastifyStatic, {
      root: join(__dirname, '..', 'uploads'),
      prefix: '/uploads/',
    });
  }

  // Configuration multipart pour les uploads de fichiers
  // N'affecte QUE les requêtes multipart/form-data
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite à 10MB par fichier
    },
  });

  // Configuration CORS - Stricte en production
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtres et intercepteurs globaux
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Pas de préfixe /api car vous utilisez api.titingre.com
  // Les URLs seront: api.titingre.com/users, api.titingre.com/posts, etc.

  // Port configurable via variable d'environnement
  const port = parseInt(process.env.PORT || '3000', 10);

  // Important: écouter sur 0.0.0.0 pour être accessible depuis l'extérieur
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Server listening on: http://localhost:${port}`);

  if (!isProduction) {
    console.log(`📁 Uploads (local): http://localhost:${port}/uploads/`);
  } else {
    console.log(`☁️  Uploads (Cloudinary): Configured`);
  }

  console.log(`🌍 Production URL: https://api.titingre.com`);
}
bootstrap();