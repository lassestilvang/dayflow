import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity("calendar_integrations")
export class CalendarIntegration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  provider!: string; // 'google', 'outlook', 'apple', 'fastmail'

  @Column({ nullable: true })
  access_token!: string;

  @Column({ nullable: true })
  refresh_token!: string;

  @Column({ type: "timestamp", nullable: true })
  expires_at!: Date;

  @Column({ nullable: true })
  scope!: string;

  @Column({ nullable: true })
  token_type!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.calendarIntegrations)
  user!: User;
}
