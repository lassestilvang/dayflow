import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddSubtasks1732549270000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create subtasks table
    await queryRunner.createTable(
      new Table({
        name: "subtasks",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "completed",
            type: "boolean",
            default: false,
          },
          {
            name: "task_id",
            type: "int",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["task_id"],
            referencedTableName: "tasks",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("subtasks");
  }
}
