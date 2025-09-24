import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Task } from "./Task";
import { Event } from "./Event";

export enum CollaborationRole {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

@Entity("collaborations")
export class Collaboration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: CollaborationRole,
    default: CollaborationRole.WRITE,
  })
  role!: CollaborationRole;

  @CreateDateColumn()
  invited_at!: Date;

  @ManyToOne(() => User, (user) => user.collaborations)
  user!: User;

  @ManyToOne(() => Task, (task) => task.collaborations, { nullable: true })
  task!: Task;

  @ManyToOne(() => Event, (event) => event.collaborations, { nullable: true })
  event!: Event;
}
