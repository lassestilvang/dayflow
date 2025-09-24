import axios from "axios";
import { ITaskImportService, ExternalTask } from "./ITaskImportService";
import { TaskImportProvider } from "../../entities/TaskImport";

export class ClickUpTaskImportService implements ITaskImportService {
  provider = TaskImportProvider.CLICKUP;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async authenticate(credentials: string): Promise<boolean> {
    try {
      await axios.get("https://api.clickup.com/api/v2/user", {
        headers: { Authorization: credentials },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    try {
      // Get user's teams first
      const teamsResponse = await axios.get(
        "https://api.clickup.com/api/v2/team",
        {
          headers: { Authorization: this.apiKey },
        }
      );

      const teams = teamsResponse.data.teams;
      if (!teams || teams.length === 0) return [];

      // Get tasks from first team's spaces (simplified)
      const spacesResponse = await axios.get(
        `https://api.clickup.com/api/v2/team/${teams[0].id}/space`,
        { headers: { Authorization: this.apiKey } }
      );

      const tasks: ExternalTask[] = [];
      for (const space of spacesResponse.data.spaces.slice(0, 1)) {
        // Limit to first space
        const listsResponse = await axios.get(
          `https://api.clickup.com/api/v2/space/${space.id}/list`,
          { headers: { Authorization: this.apiKey } }
        );

        for (const list of listsResponse.data.lists.slice(0, 1)) {
          // Limit to first list
          const tasksResponse = await axios.get(
            `https://api.clickup.com/api/v2/list/${list.id}/task`,
            { headers: { Authorization: this.apiKey } }
          );

          for (const task of tasksResponse.data.tasks) {
            tasks.push({
              id: task.id,
              title: task.name,
              description: task.description,
              due_date: task.due_date
                ? new Date(parseInt(task.due_date))
                : undefined,
              priority: this.mapPriority(task.priority?.priority),
              status: this.mapStatus(task.status?.status),
              category: task.list?.name,
            });
          }
        }
      }

      return tasks;
    } catch (error) {
      throw new Error(`Failed to fetch ClickUp tasks: ${error}`);
    }
  }

  private mapPriority(priority?: string): "low" | "medium" | "high" {
    if (!priority) return "medium";
    const lower = priority.toLowerCase();
    if (lower.includes("urgent") || lower.includes("high")) return "high";
    if (lower.includes("low")) return "low";
    return "medium";
  }

  private mapStatus(status?: string): "pending" | "in_progress" | "completed" {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (lower.includes("complete") || lower.includes("done"))
      return "completed";
    if (lower.includes("progress") || lower.includes("in"))
      return "in_progress";
    return "pending";
  }
}
