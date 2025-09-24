import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRecurrenceFields1732549310000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add rrule column to tasks table
    await queryRunner.addColumn(
      "tasks",
      new TableColumn({
        name: "rrule",
        type: "text",
        isNullable: true,
      })
    );

    // Add rrule column to events table
    await queryRunner.addColumn(
      "events",
      new TableColumn({
        name: "rrule",
        type: "text",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove rrule column from tasks table
    await queryRunner.dropColumn("tasks", "rrule");

    // Remove rrule column from events table
    await queryRunner.dropColumn("events", "rrule");
  }
}
