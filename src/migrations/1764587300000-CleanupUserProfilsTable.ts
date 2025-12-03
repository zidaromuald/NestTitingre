// migrations/1764587300000-CleanupUserProfilsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour nettoyer la table user_profils
 *
 * Supprime les colonnes qui ne sont plus nécessaires pour correspondre
 * au nouveau DTO simplifié (UpdateUserProfilDto)
 *
 * Champs conservés:
 * - photo (géré via endpoint séparé POST /users/me/photo)
 * - bio, experience, formation (modifiables via DTO)
 * - notifications_posts, notifications_email (préférences de notification)
 * - derniere_visite, derniere_interaction (statistiques)
 * - total_likes, total_commentaires, total_partages (statistiques)
 *
 * Champs supprimés (non utilisés dans le DTO):
 * - competences
 * - linkedin
 * - github
 * - portfolio
 * - langues
 * - disponibilite
 * - salaire_souhaite
 */
export class CleanupUserProfilsTable1764587300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes non utilisées
    await queryRunner.query(`
      ALTER TABLE user_profils
      DROP COLUMN IF EXISTS competences,
      DROP COLUMN IF EXISTS linkedin,
      DROP COLUMN IF EXISTS github,
      DROP COLUMN IF EXISTS portfolio,
      DROP COLUMN IF EXISTS langues,
      DROP COLUMN IF EXISTS disponibilite,
      DROP COLUMN IF EXISTS salaire_souhaite
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurer les colonnes en cas de rollback
    await queryRunner.query(`
      ALTER TABLE user_profils
      ADD COLUMN competences JSON,
      ADD COLUMN linkedin VARCHAR(255),
      ADD COLUMN github VARCHAR(255),
      ADD COLUMN portfolio VARCHAR(255),
      ADD COLUMN langues JSON,
      ADD COLUMN disponibilite VARCHAR(100),
      ADD COLUMN salaire_souhaite DECIMAL(10,2)
    `);
  }
}
