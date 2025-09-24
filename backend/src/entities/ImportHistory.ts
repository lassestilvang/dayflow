import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { TaskImportProvider } from "./TaskImport";

export enum ImportStatus {
  SUCCESS = "success",
  PARTIAL = "partial",
  FAILED = "failed",
}

@Entity("import_history")
export class ImportHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: TaskImportProvider,
  })
  provider!: TaskImportProvider;

  @Column({ type: "timestamp" })
  imported_at!: Date;

  @Column({ type: "int", default: 0 })
  tasks_imported!: number;

  @Column({ type: "int", default: 0 })
  tasks_skipped!: number;

  @Column({
    type: "enum",
    enum: ImportStatus,
    default: ImportStatus.SUCCESS,
  })
  status!: ImportStatus;

  @Column({ type: "text", nullable: true })
  error_message!: string;

  @ManyToOne(() => User, (user) => user.importHistory)
  user!: User;
}
