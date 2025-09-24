import { TaskImportProvider } from "../../entities/TaskImport";

export interface ExternalTask {
  id: string;
  title: string;
  description?: string;
  due_date?: Date;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "in_progress" | "completed";
  category?: string;
}

export interface ITaskImportService {
  provider: TaskImportProvider;
  authenticate(credentials: string): Promise<boolean>;
  fetchTasks(): Promise<ExternalTask[]>;
}
