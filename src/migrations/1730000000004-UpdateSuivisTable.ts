// migrations/1730000000004-UpdateSuivisTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour mettre à jour la table suivis
 *
 * Ajoute les colonnes de tracking et notifications
 */
export class UpdateSuivisTable1730000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la colonne date_suivi qui n'est plus utilisée
    await queryRunner.query(`
      ALTER TABLE suivis
      DROP COLUMN IF EXISTS date_suivi
    `);

    // Ajouter les nouvelles colonnes
    await queryRunner.query(`
      ALTER TABLE suivis
      ADD COLUMN notifications_posts BOOLEAN DEFAULT true,
      ADD COLUMN notifications_email BOOLEAN DEFAULT false,
      ADD COLUMN derniere_visite TIMESTAMP,
      ADD COLUMN derniere_interaction TIMESTAMP,
      ADD COLUMN total_likes INT DEFAULT 0,
      ADD COLUMN total_commentaires INT DEFAULT 0,
      ADD COLUMN total_partages INT DEFAULT 0
    `);

    // Créer index pour derniere_interaction
    await queryRunner.query(`
      CREATE INDEX IDX_suivis_derniere_interaction ON suivis(derniere_interaction)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`
      ALTER TABLE suivis
      DROP COLUMN IF EXISTS notifications_posts,
      DROP COLUMN IF EXISTS notifications_email,
      DROP COLUMN IF EXISTS derniere_visite,
      DROP COLUMN IF EXISTS derniere_interaction,
      DROP COLUMN IF EXISTS total_likes,
      DROP COLUMN IF EXISTS total_commentaires,
      DROP COLUMN IF EXISTS total_partages
    `);

    // Supprimer l'index
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_suivis_derniere_interaction
    `);

    // Restaurer date_suivi
    await queryRunner.query(`
      ALTER TABLE suivis
      ADD COLUMN date_suivi TIMESTAMP NOT NULL DEFAULT NOW()
    `);
  }
}
