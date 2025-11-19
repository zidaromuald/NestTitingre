// migrations/1730000000008-UpdatePagesPartenariatTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour ajouter les colonnes manquantes à la table pages_partenariat
 *
 * Cette migration ajoute toutes les colonnes définies dans l'entité PagePartenariat
 * mais qui n'existent pas encore dans la base de données
 */
export class UpdatePagesPartenariatTable1730000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne logo_url
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);
    `);

    // Ajouter la colonne couleur_theme
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS couleur_theme VARCHAR(20);
    `);

    // Ajouter la colonne total_transactions
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS total_transactions INT DEFAULT 0;
    `);

    // Ajouter la colonne montant_total
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS montant_total DECIMAL(15, 2) DEFAULT 0;
    `);

    // Ajouter la colonne date_debut_partenariat
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS date_debut_partenariat TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Ajouter la colonne derniere_transaction_at
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS derniere_transaction_at TIMESTAMP;
    `);

    // Ajouter la colonne secteur_activite
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS secteur_activite VARCHAR(255);
    `);

    // Ajouter la colonne is_active
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    `);

    // Ajouter la colonne metadata
    await queryRunner.query(`
      ALTER TABLE pages_partenariat
      ADD COLUMN IF NOT EXISTS metadata JSON;
    `);

    console.log('✅ Migration UpdatePagesPartenariatTable completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS derniere_transaction_at`);
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS date_debut_partenariat`);
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS montant_total`);
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS total_transactions`);
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS couleur_theme`);
    await queryRunner.query(`ALTER TABLE pages_partenariat DROP COLUMN IF EXISTS logo_url`);

    console.log('⏪ Migration UpdatePagesPartenariatTable rolled back');
  }
}
