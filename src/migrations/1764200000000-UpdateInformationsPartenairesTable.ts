import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInformationsPartenairesTable1764200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte unique existante
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      DROP CONSTRAINT IF EXISTS informations_partenaires_page_partenariat_id_partenaire_id_key
    `);

    // Supprimer les colonnes de l'ancien schéma clé-valeur
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      DROP COLUMN IF EXISTS cle,
      DROP COLUMN IF EXISTS valeur,
      DROP COLUMN IF EXISTS date_creation
    `);

    // Ajouter toutes les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      ADD COLUMN IF NOT EXISTS nom_affichage VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS localite VARCHAR(255),
      ADD COLUMN IF NOT EXISTS adresse_complete TEXT,
      ADD COLUMN IF NOT EXISTS numero_telephone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS email_contact VARCHAR(255),
      ADD COLUMN IF NOT EXISTS secteur_activite VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS superficie VARCHAR(100),
      ADD COLUMN IF NOT EXISTS type_culture VARCHAR(255),
      ADD COLUMN IF NOT EXISTS maison_etablissement VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contact_controleur VARCHAR(255),
      ADD COLUMN IF NOT EXISTS siege_social VARCHAR(255),
      ADD COLUMN IF NOT EXISTS date_creation_entreprise DATE,
      ADD COLUMN IF NOT EXISTS certificats JSON,
      ADD COLUMN IF NOT EXISTS numero_registration VARCHAR(100),
      ADD COLUMN IF NOT EXISTS capital_social DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS chiffre_affaires DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS nombre_employes INT,
      ADD COLUMN IF NOT EXISTS type_organisation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS modifiable_par VARCHAR(50) DEFAULT 'societe',
      ADD COLUMN IF NOT EXISTS visible_sur_page BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS metadata JSON
    `);

    // Renommer date_creation_entreprise en date_creation pour l'entité
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      RENAME COLUMN date_creation_entreprise TO date_creation
    `);

    // Supprimer les valeurs par défaut temporaires
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      ALTER COLUMN nom_affichage DROP DEFAULT,
      ALTER COLUMN secteur_activite DROP DEFAULT
    `);

    // Ajouter un index pour améliorer les performances
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_informations_partenaires_partenaire
      ON informations_partenaires(partenaire_id, partenaire_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer l'index
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_informations_partenaires_partenaire
    `);

    // Supprimer toutes les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      DROP COLUMN IF EXISTS nom_affichage,
      DROP COLUMN IF EXISTS description,
      DROP COLUMN IF EXISTS logo_url,
      DROP COLUMN IF EXISTS localite,
      DROP COLUMN IF EXISTS adresse_complete,
      DROP COLUMN IF EXISTS numero_telephone,
      DROP COLUMN IF EXISTS email_contact,
      DROP COLUMN IF EXISTS secteur_activite,
      DROP COLUMN IF EXISTS superficie,
      DROP COLUMN IF EXISTS type_culture,
      DROP COLUMN IF EXISTS maison_etablissement,
      DROP COLUMN IF EXISTS contact_controleur,
      DROP COLUMN IF EXISTS siege_social,
      DROP COLUMN IF EXISTS date_creation,
      DROP COLUMN IF EXISTS certificats,
      DROP COLUMN IF EXISTS numero_registration,
      DROP COLUMN IF NOT EXISTS capital_social,
      DROP COLUMN IF EXISTS chiffre_affaires,
      DROP COLUMN IF EXISTS nombre_employes,
      DROP COLUMN IF EXISTS type_organisation,
      DROP COLUMN IF EXISTS modifiable_par,
      DROP COLUMN IF EXISTS visible_sur_page,
      DROP COLUMN IF EXISTS metadata
    `);

    // Restaurer les anciennes colonnes
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      ADD COLUMN cle VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN valeur TEXT NOT NULL DEFAULT '',
      ADD COLUMN date_creation TIMESTAMP
    `);

    // Supprimer les valeurs par défaut
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      ALTER COLUMN cle DROP DEFAULT,
      ALTER COLUMN valeur DROP DEFAULT
    `);

    // Restaurer la contrainte unique
    await queryRunner.query(`
      ALTER TABLE informations_partenaires
      ADD CONSTRAINT informations_partenaires_page_partenariat_id_partenaire_id_key
      UNIQUE(page_partenariat_id, partenaire_id, partenaire_type, cle)
    `);
  }
}
