import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocaliteToTransactionsPartenariat1766000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      ADD COLUMN IF NOT EXISTS localite VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE transactions_partenariat
      DROP COLUMN IF EXISTS localite
    `);
  }
}
