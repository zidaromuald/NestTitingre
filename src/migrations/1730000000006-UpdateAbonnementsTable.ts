// migrations/1730000000006-UpdateAbonnementsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour ajouter les colonnes manquantes à la table abonnements
 *
 * Cette migration ajoute toutes les colonnes définies dans l'entité Abonnement
 * mais qui n'existent pas encore dans la base de données
 */
export class UpdateAbonnementsTable1730000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer l'enum pour le plan de collaboration si il n'existe pas
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE abonnement_plan AS ENUM ('standard', 'premium', 'enterprise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Ajouter la colonne secteur_collaboration
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS secteur_collaboration VARCHAR(255);
    `);

    // Ajouter la colonne role_utilisateur
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS role_utilisateur VARCHAR(100);
    `);

    // Ajouter la colonne solde_compte
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS solde_compte DECIMAL(15,2) DEFAULT 0;
    `);

    // Ajouter la colonne plan_collaboration (renommer de "plan")
    // D'abord, créer la nouvelle colonne
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS plan_collaboration abonnement_plan DEFAULT 'standard';
    `);

    // Copier les données de "plan" vers "plan_collaboration" si la colonne "plan" existe
    const planColumnExists = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='abonnements' AND column_name='plan'
    `);

    if (planColumnExists.length > 0) {
      // Copier les valeurs (si compatibles)
      await queryRunner.query(`
        UPDATE abonnements
        SET plan_collaboration = CASE
          WHEN plan = 'standard' THEN 'standard'::abonnement_plan
          WHEN plan = 'premium' THEN 'premium'::abonnement_plan
          WHEN plan = 'enterprise' THEN 'enterprise'::abonnement_plan
          ELSE 'standard'::abonnement_plan
        END
        WHERE plan_collaboration IS NULL AND plan IS NOT NULL
      `);

      // Supprimer l'ancienne colonne "plan"
      await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS plan`);
    }

    // Ajouter la colonne permissions (JSON)
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS permissions JSON;
    `);

    // Ajouter la colonne groupe_collaboration_id
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS groupe_collaboration_id INT;
    `);

    // Ajouter la colonne page_partenariat_id
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS page_partenariat_id INT;
    `);

    // Ajouter la colonne page_partenariat_creee
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS page_partenariat_creee BOOLEAN DEFAULT FALSE;
    `);

    // Ajouter la colonne notifications_transactions
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS notifications_transactions BOOLEAN DEFAULT TRUE;
    `);

    // Ajouter la colonne notifications_email_business
    await queryRunner.query(`
      ALTER TABLE abonnements
      ADD COLUMN IF NOT EXISTS notifications_email_business BOOLEAN DEFAULT TRUE;
    `);

    // Supprimer la colonne "montant" si elle existe (non utilisée dans l'entité)
    await queryRunner.query(`
      ALTER TABLE abonnements
      DROP COLUMN IF EXISTS montant;
    `);

    // Créer un index sur plan_collaboration
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_abonnements_plan_collaboration
      ON abonnements(plan_collaboration);
    `);

    console.log('✅ Migration UpdateAbonnementsTable completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS notifications_email_business`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS notifications_transactions`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS page_partenariat_creee`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS page_partenariat_id`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS groupe_collaboration_id`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS permissions`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS plan_collaboration`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS solde_compte`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS role_utilisateur`);
    await queryRunner.query(`ALTER TABLE abonnements DROP COLUMN IF EXISTS secteur_collaboration`);

    // Supprimer l'index
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_abonnements_plan_collaboration`);

    // Supprimer l'enum (seulement si aucune autre table ne l'utilise)
    await queryRunner.query(`DROP TYPE IF EXISTS abonnement_plan CASCADE`);

    console.log('⏪ Migration UpdateAbonnementsTable rolled back');
  }
}
