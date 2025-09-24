import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Collaboration } from "./Collaboration";
import { Subtask } from "./Subtask";

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  external_id!: string;

  @Column({ type: "timestamp", nullable: true })
  due_date!: Date;

  @Column({ type: "text", nullable: true })
  rrule!: string; // RRULE for recurring tasks

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user!: User;

  @ManyToOne(() => Category, (category) => category.tasks, { nullable: true })
  category!: Category;

  @OneToMany(() => Collaboration, (collaboration) => collaboration.task)
  collaborations!: Collaboration[];

  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subtasks!: Subtask[];
}
