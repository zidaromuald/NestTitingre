import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInformationsPartenairesSimple1764288000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte unique si elle existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'informations_partenaires_page_partenariat_id_partenaire_id_key') THEN
          ALTER TABLE informations_partenaires
          DROP CONSTRAINT informations_partenaires_page_partenariat_id_partenaire_id_key;
        END IF;
      END $$;
    `);

    // Supprimer les anciennes colonnes
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS cle`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS valeur`);

    // Ajouter les nouvelles colonnes une par une
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS nom_affichage VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS description TEXT`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS localite VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS adresse_complete TEXT`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS numero_telephone VARCHAR(50)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS email_contact VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS secteur_activite VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS superficie VARCHAR(100)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS type_culture VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS maison_etablissement VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS contact_controleur VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS siege_social VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS date_creation DATE`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS certificats JSON`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS numero_registration VARCHAR(100)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS capital_social DECIMAL(15,2)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS chiffre_affaires DECIMAL(15,2)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS nombre_employes INT`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS type_organisation VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS modifiable_par VARCHAR(50) DEFAULT 'societe'`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS visible_sur_page BOOLEAN DEFAULT true`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN IF NOT EXISTS metadata JSON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les nouvelles colonnes
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS nom_affichage`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS description`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS logo_url`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS localite`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS adresse_complete`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS numero_telephone`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS email_contact`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS secteur_activite`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS superficie`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS type_culture`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS maison_etablissement`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS contact_controleur`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS siege_social`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS date_creation`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS certificats`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS numero_registration`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS capital_social`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS chiffre_affaires`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS nombre_employes`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS type_organisation`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS modifiable_par`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS visible_sur_page`);
    await queryRunner.query(`ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS metadata`);

    // Restaurer les anciennes colonnes
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN cle VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE informations_partenaires ADD COLUMN valeur TEXT`);
  }
}
