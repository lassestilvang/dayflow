import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollaborationUpdates1732549300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update role enum
    await queryRunner.query(`
      ALTER TYPE "collaborations_role_enum" RENAME TO "collaborations_role_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "collaborations_role_enum" AS ENUM('read', 'write', 'admin')
    `);
    await queryRunner.query(`
      ALTER TABLE "collaborations" ALTER COLUMN "role" TYPE "collaborations_role_enum" USING
        CASE
          WHEN "role" = 'owner' THEN 'admin'::"collaborations_role_enum"
          WHEN "role" = 'collaborator' THEN 'write'::"collaborations_role_enum"
          ELSE 'write'::"collaborations_role_enum"
        END
    `);
    await queryRunner.query(`
      DROP TYPE "collaborations_role_enum_old"
    `);

    // Make task_id nullable
    await queryRunner.query(`
      ALTER TABLE "collaborations" ALTER COLUMN "task_id" DROP NOT NULL
    `);

    // Add event_id column
    await queryRunner.query(`
      ALTER TABLE "collaborations" ADD COLUMN "event_id" int
    `);
    await queryRunner.query(`
      ALTER TABLE "collaborations" ADD CONSTRAINT "FK_collaborations_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove event_id
    await queryRunner.query(`
      ALTER TABLE "collaborations" DROP CONSTRAINT "FK_collaborations_event_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "collaborations" DROP COLUMN "event_id"
    `);

    // Make task_id not null
    await queryRunner.query(`
      ALTER TABLE "collaborations" ALTER COLUMN "task_id" SET NOT NULL
    `);

    // Revert role enum
    await queryRunner.query(`
      ALTER TYPE "collaborations_role_enum" RENAME TO "collaborations_role_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "collaborations_role_enum" AS ENUM('owner', 'collaborator')
    `);
    await queryRunner.query(`
      ALTER TABLE "collaborations" ALTER COLUMN "role" TYPE "collaborations_role_enum" USING
        CASE
          WHEN "role" = 'admin' THEN 'owner'::"collaborations_role_enum"
          WHEN "role" = 'write' THEN 'collaborator'::"collaborations_role_enum"
          WHEN "role" = 'read' THEN 'collaborator'::"collaborations_role_enum"
          ELSE 'collaborator'::"collaborations_role_enum"
        END
    `);
    await queryRunner.query(`
      DROP TYPE "collaborations_role_enum_old"
    `);
  }
}
