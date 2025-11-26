import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToGroupeInvitations1763773068489 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE groupe_invitations
            ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'membre'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE groupe_invitations
            DROP COLUMN IF EXISTS role
        `);
    }

}
