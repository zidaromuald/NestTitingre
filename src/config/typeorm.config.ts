// config/typeorm.config.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const isProduction = process.env.NODE_ENV === 'production';
const rootDir = join(__dirname, '../..');

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'titingre_db',

  // Entities et migrations - Adaptation automatique dev/prod
  entities: [
    isProduction
      ? join(rootDir, 'dist/**/*.entity.js')  // En prod, utilise les fichiers compilés
      : join(rootDir, 'src/**/*.entity.ts')   // En dev, utilise les fichiers source
  ],

  migrations: [
    isProduction
      ? join(rootDir, 'dist/migrations/*.js')
      : join(rootDir, 'src/migrations/*.ts')
  ],

  // Options de base
  synchronize: false, // TOUJOURS false en production !
  logging: process.env.NODE_ENV === 'development',

  // Options avancées
  migrationsRun: false, // On lance manuellement

  // SSL pour production (si nécessaire selon votre hébergeur)
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

// DataSource pour les migrations CLI
const dataSource = new DataSource(typeOrmConfig);
export default dataSource;
