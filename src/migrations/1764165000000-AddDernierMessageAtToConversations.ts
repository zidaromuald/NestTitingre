import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDernierMessageAtToConversations1764165000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne dernier_message_at à la table conversations
    await queryRunner.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS dernier_message_at TIMESTAMP NULL
    `);

    // Ajouter la colonne is_archived si elle n'existe pas
    await queryRunner.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false
    `);

    // Ajouter la colonne metadata si elle n'existe pas
    await queryRunner.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS metadata JSON NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`
      ALTER TABLE conversations
      DROP COLUMN IF EXISTS dernier_message_at
    `);

    await queryRunner.query(`
      ALTER TABLE conversations
      DROP COLUMN IF EXISTS is_archived
    `);

    await queryRunner.query(`
      ALTER TABLE conversations
      DROP COLUMN IF EXISTS metadata
    `);
  }
}
