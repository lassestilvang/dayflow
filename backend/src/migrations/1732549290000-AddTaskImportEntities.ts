import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddTaskImportEntities1732549290000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add external_id to tasks table
    await queryRunner.addColumn(
      "tasks",
      new TableColumn({
        name: "external_id",
        type: "varchar",
        isNullable: true,
      })
    );

    // Create task_imports table
    await queryRunner.createTable(
      new Table({
        name: "task_imports",
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
            type: "enum",
            enum: ["notion", "clickup", "linear", "todoist"],
          },
          {
            name: "credentials",
            type: "text",
          },
          {
            name: "access_token",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "refresh_token",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "token_expires_at",
            type: "timestamp",
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

    // Create import_history table
    await queryRunner.createTable(
      new Table({
        name: "import_history",
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
            type: "enum",
            enum: ["notion", "clickup", "linear", "todoist"],
          },
          {
            name: "imported_at",
            type: "timestamp",
          },
          {
            name: "tasks_imported",
            type: "int",
            default: 0,
          },
          {
            name: "tasks_skipped",
            type: "int",
            default: 0,
          },
          {
            name: "status",
            type: "enum",
            enum: ["success", "partial", "failed"],
            default: "'success'",
          },
          {
            name: "error_message",
            type: "text",
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("import_history");
    await queryRunner.dropTable("task_imports");
    await queryRunner.dropColumn("tasks", "external_id");
  }
}
