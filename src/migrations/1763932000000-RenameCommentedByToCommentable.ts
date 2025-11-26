import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration pour renommer les colonnes commented_by_* en commentable_*
 * dans la table commentaires pour correspondre à l'entité TypeORM
 */
export class RenameCommentedByToCommentable1763932000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer l'index existant sur commented_by
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_commentaires_commented_by"`,
    );

    // Renommer les colonnes
    await queryRunner.query(`
      ALTER TABLE commentaires
      RENAME COLUMN commented_by_id TO commentable_id
    `);

    await queryRunner.query(`
      ALTER TABLE commentaires
      RENAME COLUMN commented_by_type TO commentable_type
    `);

    // Recréer l'index avec le nouveau nom
    await queryRunner.query(`
      CREATE INDEX "IDX_commentaires_commentable"
      ON commentaires(commentable_id, commentable_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer le nouvel index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_commentaires_commentable"`,
    );

    // Renommer les colonnes en arrière
    await queryRunner.query(`
      ALTER TABLE commentaires
      RENAME COLUMN commentable_id TO commented_by_id
    `);

    await queryRunner.query(`
      ALTER TABLE commentaires
      RENAME COLUMN commentable_type TO commented_by_type
    `);

    // Recréer l'ancien index
    await queryRunner.query(`
      CREATE INDEX "IDX_commentaires_commented_by"
      ON commentaires(commented_by_id, commented_by_type)
    `);
  }
}
