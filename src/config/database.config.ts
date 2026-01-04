// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  name: process.env.DB_NAME || 'titingre_db',

  // IMPORTANT: Synchronize TOUJOURS false (on utilise les migrations)
  synchronize: false,

  // Logging adaptatif selon l'environnement
  logging: process.env.NODE_ENV === 'development',
}));