import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Category } from "./entities/Category";
import { Task } from "./entities/Task";
import { Event } from "./entities/Event";
import { Collaboration } from "./entities/Collaboration";
import { Subtask } from "./entities/Subtask";
import { CalendarIntegration } from "./entities/CalendarIntegration";
import { TaskImport } from "./entities/TaskImport";
import { ImportHistory } from "./entities/ImportHistory";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "dayflow",
  synchronize: false, // Use migrations instead
  logging: false,
  entities: [
    User,
    Category,
    Task,
    Event,
    Collaboration,
    Subtask,
    CalendarIntegration,
    TaskImport,
    ImportHistory,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
