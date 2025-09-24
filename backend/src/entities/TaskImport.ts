import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

export enum TaskImportProvider {
  NOTION = "notion",
  CLICKUP = "clickup",
  LINEAR = "linear",
  TODOIST = "todoist",
}

@Entity("task_imports")
export class TaskImport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: TaskImportProvider,
  })
  provider!: TaskImportProvider;

  @Column({ type: "text" })
  credentials!: string; // Encrypted API key or OAuth token

  @Column({ nullable: true })
  access_token!: string;

  @Column({ nullable: true })
  refresh_token!: string;

  @Column({ type: "timestamp", nullable: true })
  token_expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.taskImports)
  user!: User;
}
