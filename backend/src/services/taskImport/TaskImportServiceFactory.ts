import { TaskImportProvider } from "../../entities/TaskImport";
import { ITaskImportService } from "./ITaskImportService";
import { NotionTaskImportService } from "./NotionTaskImportService";
import { ClickUpTaskImportService } from "./ClickUpTaskImportService";
import { LinearTaskImportService } from "./LinearTaskImportService";
import { TodoistTaskImportService } from "./TodoistTaskImportService";

export class TaskImportServiceFactory {
  static createService(
    provider: TaskImportProvider,
    credentials: string
  ): ITaskImportService {
    switch (provider) {
      case TaskImportProvider.NOTION:
        return new NotionTaskImportService(credentials);
      case TaskImportProvider.CLICKUP:
        return new ClickUpTaskImportService(credentials);
      case TaskImportProvider.LINEAR:
        return new LinearTaskImportService(credentials);
      case TaskImportProvider.TODOIST:
        return new TodoistTaskImportService(credentials);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
