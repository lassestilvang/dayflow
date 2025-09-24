import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Category } from "./Category";
import { Task } from "./Task";
import { Event } from "./Event";
import { Collaboration } from "./Collaboration";
import { CalendarIntegration } from "./CalendarIntegration";
import { TaskImport } from "./TaskImport";
import { ImportHistory } from "./ImportHistory";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @OneToMany(() => Event, (event) => event.user)
  events!: Event[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.user)
  collaborations!: Collaboration[];

  @OneToMany(() => CalendarIntegration, (integration) => integration.user)
  calendarIntegrations!: CalendarIntegration[];

  @OneToMany(() => TaskImport, (taskImport) => taskImport.user)
  taskImports!: TaskImport[];

  @OneToMany(() => ImportHistory, (importHistory) => importHistory.user)
  importHistory!: ImportHistory[];
}
