import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTransactionsPartenaritTable1764289000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne categorie
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS categorie VARCHAR(100)
    `);

    // Ajouter la colonne creee_par_societe si elle n'existe pas
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS creee_par_societe BOOLEAN DEFAULT true
    `);

    // Ajouter la colonne date_modification_societe
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS date_modification_societe TIMESTAMP
    `);

    // Ajouter la colonne documents (JSON)
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS documents JSON
    `);

    // Ajouter la colonne notes
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);

    // Ajouter la colonne commentaire_user (renommer commentaire_validation s'il existe)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transactions_partenariat'
          AND column_name = 'commentaire_validation'
        ) THEN
          ALTER TABLE transactions_partenariat
          RENAME COLUMN commentaire_validation TO commentaire_user;
        ELSE
          ALTER TABLE transactions_partenariat
          ADD COLUMN commentaire_user TEXT;
        END IF;
      END $$;
    `);

    // Ajouter la colonne metadata (JSON)
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS metadata JSON
    `);

    // Ajouter la colonne devise
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'CFA'
    `);

    // Renommer montant_total en prix_total si nécessaire
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transactions_partenariat'
          AND column_name = 'montant_total'
        ) THEN
          ALTER TABLE transactions_partenariat
          RENAME COLUMN montant_total TO prix_total;
        END IF;
      END $$;
    `);

    // Ajuster les types de colonnes existantes si nécessaire
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ALTER COLUMN date_debut TYPE DATE,
      ALTER COLUMN date_fin TYPE DATE,
      ALTER COLUMN prix_unitaire TYPE DECIMAL(15,2),
      ALTER COLUMN quantite TYPE DECIMAL(15,3)
    `);

    // Mettre à jour la précision de prix_total
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ALTER COLUMN prix_total TYPE DECIMAL(15,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      DROP COLUMN IF EXISTS categorie,
      DROP COLUMN IF EXISTS creee_par_societe,
      DROP COLUMN IF EXISTS date_modification_societe,
      DROP COLUMN IF EXISTS documents,
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS devise
    `);

    // Renommer commentaire_user en commentaire_validation
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transactions_partenariat'
          AND column_name = 'commentaire_user'
        ) THEN
          ALTER TABLE transactions_partenariat
          RENAME COLUMN commentaire_user TO commentaire_validation;
        END IF;
      END $$;
    `);

    // Renommer prix_total en montant_total
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transactions_partenariat'
          AND column_name = 'prix_total'
        ) THEN
          ALTER TABLE transactions_partenariat
          RENAME COLUMN prix_total TO montant_total;
        END IF;
      END $$;
    `);

    // Restaurer les types originaux
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ALTER COLUMN date_debut TYPE TIMESTAMP,
      ALTER COLUMN date_fin TYPE TIMESTAMP,
      ALTER COLUMN prix_unitaire TYPE DECIMAL(10,2),
      ALTER COLUMN quantite TYPE INT
    `);

    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ALTER COLUMN montant_total TYPE DECIMAL(10,2)
    `);
  }
}
