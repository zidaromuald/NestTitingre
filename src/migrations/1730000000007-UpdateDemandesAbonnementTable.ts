// migrations/1730000000007-UpdateDemandesAbonnementTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour ajouter les colonnes manquantes à la table demandes_abonnement
 *
 * Cette migration ajoute toutes les colonnes définies dans l'entité DemandeAbonnement
 * mais qui n'existent pas encore dans la base de données
 */
export class UpdateDemandesAbonnementTable1730000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne secteur_collaboration
    await queryRunner.query(`
      ALTER TABLE demandes_abonnement
      ADD COLUMN IF NOT EXISTS secteur_collaboration VARCHAR(255);
    `);

    // Ajouter la colonne role_utilisateur
    await queryRunner.query(`
      ALTER TABLE demandes_abonnement
      ADD COLUMN IF NOT EXISTS role_utilisateur VARCHAR(100);
    `);

    // Ajouter la colonne description_partenariat
    await queryRunner.query(`
      ALTER TABLE demandes_abonnement
      ADD COLUMN IF NOT EXISTS description_partenariat TEXT;
    `);

    // Ajouter la colonne expires_at
    await queryRunner.query(`
      ALTER TABLE demandes_abonnement
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    `);

    // Ajouter la colonne responded_at
    await queryRunner.query(`
      ALTER TABLE demandes_abonnement
      ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;
    `);

    console.log('✅ Migration UpdateDemandesAbonnementTable completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`ALTER TABLE demandes_abonnement DROP COLUMN IF EXISTS responded_at`);
    await queryRunner.query(`ALTER TABLE demandes_abonnement DROP COLUMN IF EXISTS expires_at`);
    await queryRunner.query(`ALTER TABLE demandes_abonnement DROP COLUMN IF EXISTS description_partenariat`);
    await queryRunner.query(`ALTER TABLE demandes_abonnement DROP COLUMN IF EXISTS role_utilisateur`);
    await queryRunner.query(`ALTER TABLE demandes_abonnement DROP COLUMN IF EXISTS secteur_collaboration`);

    console.log('⏪ Migration UpdateDemandesAbonnementTable rolled back');
  }
}
