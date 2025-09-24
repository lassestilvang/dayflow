import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddCalendarIntegrationAndEventFields1732549280000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create calendar_integrations table
    await queryRunner.createTable(
      new Table({
        name: "calendar_integrations",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "provider",
            type: "varchar",
          },
          {
            name: "access_token",
            type: "text",
            isNullable: true,
          },
          {
            name: "refresh_token",
            type: "text",
            isNullable: true,
          },
          {
            name: "expires_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "scope",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "token_type",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "user_id",
            type: "int",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );

    // Add source and external_id columns to events table
    await queryRunner.addColumns("events", [
      new TableColumn({
        name: "source",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "external_id",
        type: "varchar",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop calendar_integrations table
    await queryRunner.dropTable("calendar_integrations");

    // Remove columns from events table
    await queryRunner.dropColumn("events", "source");
    await queryRunner.dropColumn("events", "external_id");
  }
}
