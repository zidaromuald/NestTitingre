// migrations/1730000000002-UpdateUserProfilsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour mettre à jour la table user_profils
 *
 * Cette migration aligne la structure de la table user_profils
 * avec l'entité UserProfil définie dans le code
 */
export class UpdateUserProfilsTable1730000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renommer photo_profil en photo
    await queryRunner.query(`
      ALTER TABLE user_profils
      RENAME COLUMN photo_profil TO photo
    `);

    // Supprimer les colonnes qui ne sont plus utilisées
    await queryRunner.query(`
      ALTER TABLE user_profils
      DROP COLUMN IF EXISTS date_naissance,
      DROP COLUMN IF EXISTS adresse,
      DROP COLUMN IF EXISTS ville,
      DROP COLUMN IF EXISTS code_postal,
      DROP COLUMN IF EXISTS pays,
      DROP COLUMN IF EXISTS telephone,
      DROP COLUMN IF EXISTS site_web,
      DROP COLUMN IF EXISTS reseaux_sociaux,
      DROP COLUMN IF EXISTS preferences
    `);

    // Ajouter les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE user_profils
      ADD COLUMN competences JSON,
      ADD COLUMN experience TEXT,
      ADD COLUMN formation TEXT,
      ADD COLUMN linkedin VARCHAR(255),
      ADD COLUMN github VARCHAR(255),
      ADD COLUMN portfolio VARCHAR(255),
      ADD COLUMN langues JSON,
      ADD COLUMN disponibilite VARCHAR(100),
      ADD COLUMN salaire_souhaite DECIMAL(10,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revenir à l'ancienne structure
    await queryRunner.query(`
      ALTER TABLE user_profils
      RENAME COLUMN photo TO photo_profil
    `);

    // Supprimer les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE user_profils
      DROP COLUMN IF EXISTS competences,
      DROP COLUMN IF EXISTS experience,
      DROP COLUMN IF EXISTS formation,
      DROP COLUMN IF EXISTS linkedin,
      DROP COLUMN IF EXISTS github,
      DROP COLUMN IF EXISTS portfolio,
      DROP COLUMN IF EXISTS langues,
      DROP COLUMN IF EXISTS disponibilite,
      DROP COLUMN IF EXISTS salaire_souhaite
    `);

    // Restaurer les anciennes colonnes
    await queryRunner.query(`
      ALTER TABLE user_profils
      ADD COLUMN date_naissance DATE,
      ADD COLUMN adresse TEXT,
      ADD COLUMN ville VARCHAR(255),
      ADD COLUMN code_postal VARCHAR(20),
      ADD COLUMN pays VARCHAR(255),
      ADD COLUMN telephone VARCHAR(20),
      ADD COLUMN site_web VARCHAR(255),
      ADD COLUMN reseaux_sociaux JSON,
      ADD COLUMN preferences JSON
    `);
  }
}
