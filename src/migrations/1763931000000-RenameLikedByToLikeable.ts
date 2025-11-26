import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour renommer les colonnes liked_by_* en likeable_*
 * dans la table likes pour correspondre à l'entité TypeORM
 */
export class RenameLikedByToLikeable1763931000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer l'index existant sur liked_by
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_likes_liked_by"`);

    // Supprimer la contrainte UNIQUE existante
    await queryRunner.query(`
      ALTER TABLE likes
      DROP CONSTRAINT IF EXISTS likes_post_id_liked_by_id_liked_by_type_key
    `);

    // Renommer les colonnes
    await queryRunner.query(`
      ALTER TABLE likes
      RENAME COLUMN liked_by_id TO likeable_id
    `);

    await queryRunner.query(`
      ALTER TABLE likes
      RENAME COLUMN liked_by_type TO likeable_type
    `);

    // Recréer l'index avec le nouveau nom
    await queryRunner.query(`
      CREATE INDEX "IDX_likes_likeable"
      ON likes(likeable_id, likeable_type)
    `);

    // Recréer la contrainte UNIQUE avec les nouveaux noms
    await queryRunner.query(`
      ALTER TABLE likes
      ADD CONSTRAINT "UQ_likes_post_likeable"
      UNIQUE (post_id, likeable_id, likeable_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer le nouvel index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_likes_likeable"`);

    // Supprimer la nouvelle contrainte UNIQUE
    await queryRunner.query(`
      ALTER TABLE likes
      DROP CONSTRAINT IF EXISTS "UQ_likes_post_likeable"
    `);

    // Renommer les colonnes en arrière
    await queryRunner.query(`
      ALTER TABLE likes
      RENAME COLUMN likeable_id TO liked_by_id
    `);

    await queryRunner.query(`
      ALTER TABLE likes
      RENAME COLUMN likeable_type TO liked_by_type
    `);

    // Recréer l'ancien index
    await queryRunner.query(`
      CREATE INDEX "IDX_likes_liked_by"
      ON likes(liked_by_id, liked_by_type)
    `);

    // Recréer l'ancienne contrainte UNIQUE
    await queryRunner.query(`
      ALTER TABLE likes
      ADD CONSTRAINT "likes_post_id_liked_by_id_liked_by_type_key"
      UNIQUE (post_id, liked_by_id, liked_by_type)
    `);
  }
}
