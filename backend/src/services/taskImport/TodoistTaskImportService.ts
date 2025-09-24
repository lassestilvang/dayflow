import axios from "axios";
import { ITaskImportService, ExternalTask } from "./ITaskImportService";
import { TaskImportProvider } from "../../entities/TaskImport";

export class TodoistTaskImportService implements ITaskImportService {
  provider = TaskImportProvider.TODOIST;
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async authenticate(credentials: string): Promise<boolean> {
    try {
      await axios.get("https://api.todoist.com/rest/v2/projects", {
        headers: { Authorization: `Bearer ${credentials}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    try {
      const response = await axios.get(
        "https://api.todoist.com/rest/v2/tasks",
        {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        }
      );

      const tasks: ExternalTask[] = response.data.map((task: any) => ({
        id: task.id.toString(),
        title: task.content,
        description: task.description,
        due_date: task.due?.date ? new Date(task.due.date) : undefined,
        priority: this.mapPriority(task.priority),
        status: task.completed ? "completed" : "pending",
        category: task.project_id?.toString(), // Could map to project name
      }));

      return tasks;
    } catch (error) {
      throw new Error(`Failed to fetch Todoist tasks: ${error}`);
    }
  }

  private mapPriority(priority?: number): "low" | "medium" | "high" {
    // Todoist: 1 = normal, 2 = high, 3 = very high, 4 = priority 1
    if (priority === 4) return "high";
    if (priority === 3) return "high";
    if (priority === 2) return "medium";
    return "low";
  }
}
