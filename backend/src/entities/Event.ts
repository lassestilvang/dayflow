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
import { Collaboration } from "./Collaboration";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "timestamp" })
  start_time!: Date;

  @Column({ type: "timestamp" })
  end_time!: Date;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  source!: string; // 'google', 'outlook', 'apple', 'fastmail', or null for local events

  @Column({ nullable: true })
  external_id!: string; // ID from the external calendar provider

  @Column({ type: "text", nullable: true })
  rrule!: string; // RRULE for recurring events

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.events)
  user!: User;

  @OneToMany(() => Collaboration, (collaboration) => collaboration.event)
  collaborations!: Collaboration[];
}
