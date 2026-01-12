import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneVerificationToUsers1736683200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne is_phone_verified
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_phone_verified',
        type: 'boolean',
        default: false,
      }),
    );

    // Ajouter la colonne phone_verified_at
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone_verified_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes en cas de rollback
    await queryRunner.dropColumn('users', 'phone_verified_at');
    await queryRunner.dropColumn('users', 'is_phone_verified');
  }
}
