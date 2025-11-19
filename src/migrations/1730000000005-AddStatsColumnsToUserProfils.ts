// migrations/1730000000005-AddStatsColumnsToUserProfils.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour ajouter les colonnes de statistiques et notifications à user_profils
 */
export class AddStatsColumnsToUserProfils1730000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier et ajouter les colonnes si elles n'existent pas
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Ajouter notifications_posts si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'notifications_posts'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN notifications_posts BOOLEAN DEFAULT true;
        END IF;

        -- Ajouter notifications_email si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'notifications_email'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN notifications_email BOOLEAN DEFAULT false;
        END IF;

        -- Ajouter derniere_visite si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'derniere_visite'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN derniere_visite TIMESTAMP;
        END IF;

        -- Ajouter derniere_interaction si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'derniere_interaction'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN derniere_interaction TIMESTAMP;
        END IF;

        -- Ajouter total_likes si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'total_likes'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN total_likes INT DEFAULT 0;
        END IF;

        -- Ajouter total_commentaires si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'total_commentaires'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN total_commentaires INT DEFAULT 0;
        END IF;

        -- Ajouter total_partages si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user_profils' AND column_name = 'total_partages'
        ) THEN
          ALTER TABLE user_profils ADD COLUMN total_partages INT DEFAULT 0;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes lors du rollback
    await queryRunner.query(`
      ALTER TABLE user_profils
      DROP COLUMN IF EXISTS notifications_posts,
      DROP COLUMN IF EXISTS notifications_email,
      DROP COLUMN IF EXISTS derniere_visite,
      DROP COLUMN IF EXISTS derniere_interaction,
      DROP COLUMN IF EXISTS total_likes,
      DROP COLUMN IF EXISTS total_commentaires,
      DROP COLUMN IF EXISTS total_partages
    `);
  }
}
