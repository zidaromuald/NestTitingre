import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateMessagesGroupeTable1765577497629 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer le type enum pour message_groupe_type
        await queryRunner.query(`
            CREATE TYPE "message_groupe_type" AS ENUM ('normal', 'system', 'alert', 'annonce')
        `);

        // Créer le type enum pour message_groupe_statut
        await queryRunner.query(`
            CREATE TYPE "message_groupe_statut" AS ENUM ('sent', 'deleted', 'archived')
        `);

        // Créer la table messages_groupe
        await queryRunner.createTable(
            new Table({
                name: 'messages_groupe',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'groupe_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sender_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'sender_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'contenu',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'message_groupe_type',
                        default: "'normal'",
                    },
                    {
                        name: 'statut',
                        type: 'message_groupe_statut',
                        default: "'sent'",
                    },
                    {
                        name: 'fichiers',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'is_pinned',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'is_edited',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'edited_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'read_by',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Créer les index
        await queryRunner.createIndex(
            'messages_groupe',
            new TableIndex({
                name: 'IDX_MESSAGES_GROUPE_GROUPE_ID',
                columnNames: ['groupe_id'],
            }),
        );

        await queryRunner.createIndex(
            'messages_groupe',
            new TableIndex({
                name: 'IDX_MESSAGES_GROUPE_SENDER',
                columnNames: ['sender_id', 'sender_type'],
            }),
        );

        await queryRunner.createIndex(
            'messages_groupe',
            new TableIndex({
                name: 'IDX_MESSAGES_GROUPE_CREATED_AT',
                columnNames: ['created_at'],
            }),
        );

        // Créer la clé étrangère vers groupes
        await queryRunner.createForeignKey(
            'messages_groupe',
            new TableForeignKey({
                name: 'FK_MESSAGES_GROUPE_GROUPE',
                columnNames: ['groupe_id'],
                referencedTableName: 'groupes',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la clé étrangère
        await queryRunner.dropForeignKey('messages_groupe', 'FK_MESSAGES_GROUPE_GROUPE');

        // Supprimer les index
        await queryRunner.dropIndex('messages_groupe', 'IDX_MESSAGES_GROUPE_CREATED_AT');
        await queryRunner.dropIndex('messages_groupe', 'IDX_MESSAGES_GROUPE_SENDER');
        await queryRunner.dropIndex('messages_groupe', 'IDX_MESSAGES_GROUPE_GROUPE_ID');

        // Supprimer la table
        await queryRunner.dropTable('messages_groupe');

        // Supprimer les types enum
        await queryRunner.query(`DROP TYPE "message_groupe_statut"`);
        await queryRunner.query(`DROP TYPE "message_groupe_type"`);
    }

}
