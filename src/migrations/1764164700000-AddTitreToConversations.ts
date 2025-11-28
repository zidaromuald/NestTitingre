import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitreToConversations1764164700000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne titre à la table conversations
    await queryRunner.query(`
      ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS titre VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la colonne titre
    await queryRunner.query(`
      ALTER TABLE conversations
      DROP COLUMN IF EXISTS titre
    `);
  }
}
