import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocieteIdColumnToPosts1763929000000 implements MigrationInterface {
  name = 'AddSocieteIdColumnToPosts1763929000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne existe déjà avant de l'ajouter
    const table = await queryRunner.getTable('posts');
    const societeIdColumn = table?.findColumnByName('societe_id');

    if (!societeIdColumn) {
      await queryRunner.query(
        `ALTER TABLE "posts" ADD COLUMN "societe_id" INT`,
      );

      await queryRunner.query(
        `ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_societe" FOREIGN KEY ("societe_id") REFERENCES "societes"("id") ON DELETE SET NULL`,
      );

      await queryRunner.query(
        `CREATE INDEX "idx_posts_societe_id" ON "posts"("societe_id")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_posts_societe_id"`);
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "fk_posts_societe"`,
    );
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "societe_id"`);
  }
}
