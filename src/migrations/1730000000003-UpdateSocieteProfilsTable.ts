// migrations/1730000000003-UpdateSocieteProfilsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour mettre à jour la table societe_profils
 *
 * Cette migration aligne la structure de la table societe_profils
 * avec l'entité SocieteProfil définie dans le code
 */
export class UpdateSocieteProfilsTable1730000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renommer photo_couverture en logo
    await queryRunner.query(`
      ALTER TABLE societe_profils
      RENAME COLUMN photo_couverture TO logo
    `);

    // Renommer presentation_longue en description
    await queryRunner.query(`
      ALTER TABLE societe_profils
      RENAME COLUMN presentation_longue TO description
    `);

    // Supprimer les colonnes qui ne sont plus utilisées
    await queryRunner.query(`
      ALTER TABLE societe_profils
      DROP COLUMN IF EXISTS reseaux_sociaux,
      DROP COLUMN IF EXISTS horaires_ouverture
    `);

    // Ajouter les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE societe_profils
      ADD COLUMN secteur_activite VARCHAR(255),
      ADD COLUMN taille_entreprise VARCHAR(100),
      ADD COLUMN chiffre_affaires DECIMAL(15,2),
      ADD COLUMN adresse_complete VARCHAR(255),
      ADD COLUMN ville VARCHAR(100),
      ADD COLUMN pays VARCHAR(100),
      ADD COLUMN code_postal VARCHAR(20),
      ADD COLUMN telephone VARCHAR(50),
      ADD COLUMN email_contact VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revenir à l'ancienne structure
    await queryRunner.query(`
      ALTER TABLE societe_profils
      RENAME COLUMN logo TO photo_couverture
    `);

    await queryRunner.query(`
      ALTER TABLE societe_profils
      RENAME COLUMN description TO presentation_longue
    `);

    // Supprimer les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE societe_profils
      DROP COLUMN IF EXISTS secteur_activite,
      DROP COLUMN IF EXISTS taille_entreprise,
      DROP COLUMN IF EXISTS chiffre_affaires,
      DROP COLUMN IF EXISTS adresse_complete,
      DROP COLUMN IF EXISTS ville,
      DROP COLUMN IF EXISTS pays,
      DROP COLUMN IF EXISTS code_postal,
      DROP COLUMN IF EXISTS telephone,
      DROP COLUMN IF EXISTS email_contact
    `);

    // Restaurer les anciennes colonnes
    await queryRunner.query(`
      ALTER TABLE societe_profils
      ADD COLUMN reseaux_sociaux JSON,
      ADD COLUMN horaires_ouverture JSON
    `);
  }
}
