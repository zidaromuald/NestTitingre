import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageToInvitationsSuivi1730000000009 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'message' column to invitations_suivi table
        await queryRunner.query(`
            ALTER TABLE invitations_suivi
            ADD COLUMN IF NOT EXISTS message TEXT NULL
        `);

        // Add 'responded_at' column to invitations_suivi table
        await queryRunner.query(`
            ALTER TABLE invitations_suivi
            ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove 'responded_at' column
        await queryRunner.query(`
            ALTER TABLE invitations_suivi
            DROP COLUMN IF EXISTS responded_at
        `);

        // Remove 'message' column
        await queryRunner.query(`
            ALTER TABLE invitations_suivi
            DROP COLUMN IF EXISTS message
        `);
    }
}
