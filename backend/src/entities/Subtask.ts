import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Task } from "./Task";

@Entity("subtasks")
export class Subtask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ default: false })
  completed!: boolean;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: "CASCADE" })
  task!: Task;
}
