import axios from "axios";
import { ITaskImportService, ExternalTask } from "./ITaskImportService";
import { TaskImportProvider } from "../../entities/TaskImport";

export class LinearTaskImportService implements ITaskImportService {
  provider = TaskImportProvider.LINEAR;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async authenticate(credentials: string): Promise<boolean> {
    try {
      const query = `query { viewer { id } }`;
      await axios.post(
        "https://api.linear.app/graphql",
        { query },
        { headers: { Authorization: credentials } }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    try {
      const query = `
        query {
          viewer {
            assignedIssues {
              nodes {
                id
                title
                description
                dueDate
                priority
                state {
                  name
                }
                project {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        "https://api.linear.app/graphql",
        { query },
        { headers: { Authorization: this.apiKey } }
      );

      const issues = response.data.data.viewer.assignedIssues.nodes;
      const tasks: ExternalTask[] = issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        due_date: issue.dueDate ? new Date(issue.dueDate) : undefined,
        priority: this.mapPriority(issue.priority),
        status: this.mapStatus(issue.state?.name),
        category: issue.project?.name,
      }));

      return tasks;
    } catch (error) {
      throw new Error(`Failed to fetch Linear tasks: ${error}`);
    }
  }

  private mapPriority(priority?: number): "low" | "medium" | "high" {
    if (priority === 1) return "high"; // Urgent
    if (priority === 2) return "high"; // High
    if (priority === 3) return "medium"; // Medium
    if (priority === 4) return "low"; // Low
    return "medium";
  }

  private mapStatus(status?: string): "pending" | "in_progress" | "completed" {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (
      lower.includes("done") ||
      lower.includes("completed") ||
      lower.includes("closed")
    )
      return "completed";
    if (lower.includes("progress") || lower.includes("started"))
      return "in_progress";
    return "pending";
  }
}
