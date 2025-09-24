import { Client } from "@notionhq/client";
import { ITaskImportService, ExternalTask } from "./ITaskImportService";
import { TaskImportProvider } from "../../entities/TaskImport";

export class NotionTaskImportService implements ITaskImportService {
  provider = TaskImportProvider.NOTION;
  private client: Client;

  constructor(apiKey: string) {
    this.client = new Client({ auth: apiKey });
  }

  async authenticate(credentials: string): Promise<boolean> {
    try {
      // Test authentication by listing users
      await this.client.users.list({});
      return true;
    } catch (error) {
      return false;
    }
  }

  async fetchTasks(): Promise<ExternalTask[]> {
    // This is a simplified implementation
    // In a real scenario, you'd need to configure which database to query
    // For now, we'll assume a default database ID or require it in credentials

    const databaseId = process.env.NOTION_DATABASE_ID || "default"; // Should be configured

    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
      });

      const tasks: ExternalTask[] = [];

      for (const page of response.results) {
        if ("properties" in page) {
          const properties = page.properties;

          // Map Notion properties to our task format
          // This mapping would need to be configurable
          const title =
            properties.Name?.type === "title"
              ? properties.Name.title[0]?.plain_text || ""
              : "";

          const description =
            properties.Description?.type === "rich_text"
              ? properties.Description.rich_text[0]?.plain_text || ""
              : "";

          const dueDate =
            properties.DueDate?.type === "date"
              ? properties.DueDate.date?.start
              : undefined;

          const priority =
            properties.Priority?.type === "select"
              ? this.mapPriority(properties.Priority.select?.name)
              : "medium";

          const status =
            properties.Status?.type === "status"
              ? this.mapStatus(properties.Status.status?.name)
              : "pending";

          const category =
            properties.Category?.type === "select"
              ? properties.Category.select?.name
              : undefined;

          tasks.push({
            id: page.id,
            title,
            description,
            due_date: dueDate ? new Date(dueDate) : undefined,
            priority,
            status,
            category,
          });
        }
      }

      return tasks;
    } catch (error) {
      throw new Error(`Failed to fetch Notion tasks: ${error}`);
    }
  }

  private mapPriority(notionPriority?: string): "low" | "medium" | "high" {
    if (!notionPriority) return "medium";
    const lower = notionPriority.toLowerCase();
    if (lower.includes("high") || lower.includes("urgent")) return "high";
    if (lower.includes("low")) return "low";
    return "medium";
  }

  private mapStatus(
    notionStatus?: string
  ): "pending" | "in_progress" | "completed" {
    if (!notionStatus) return "pending";
    const lower = notionStatus.toLowerCase();
    if (lower.includes("done") || lower.includes("completed"))
      return "completed";
    if (lower.includes("in progress") || lower.includes("doing"))
      return "in_progress";
    return "pending";
  }
}
