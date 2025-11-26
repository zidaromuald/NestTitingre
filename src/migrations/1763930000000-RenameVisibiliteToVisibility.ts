import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameVisibiliteToVisibility1763930000000
  implements MigrationInterface
{
  name = 'RenameVisibiliteToVisibility1763930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne 'visibilite' existe
    const table = await queryRunner.getTable('posts');
    const visibiliteColumn = table?.findColumnByName('visibilite');
    const visibilityColumn = table?.findColumnByName('visibility');

    // Si 'visibilite' existe mais pas 'visibility', renommer la colonne
    if (visibiliteColumn && !visibilityColumn) {
      await queryRunner.query(
        `ALTER TABLE "posts" RENAME COLUMN "visibilite" TO "visibility"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Renommer en sens inverse
    await queryRunner.query(
      `ALTER TABLE "posts" RENAME COLUMN "visibility" TO "visibilite"`,
    );
  }
}
