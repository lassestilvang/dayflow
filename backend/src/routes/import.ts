import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { Category } from "../entities/Category";
import { TaskImport } from "../entities/TaskImport";
import { ImportHistory, ImportStatus } from "../entities/ImportHistory";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { TaskImportServiceFactory } from "../services/taskImport/TaskImportServiceFactory";
import { ExternalTask } from "../services/taskImport/ITaskImportService";

const router = Router();
const taskRepository = AppDataSource.getRepository(Task);
const categoryRepository = AppDataSource.getRepository(Category);
const taskImportRepository = AppDataSource.getRepository(TaskImport);
const importHistoryRepository = AppDataSource.getRepository(ImportHistory);

// Import tasks from a connected service
router.post("/:importId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { importId } = req.params;

    const taskImport = await taskImportRepository.findOne({
      where: { id: parseInt(importId), user: { id: user.id } },
    });

    if (!taskImport) {
      return res.status(404).json({ error: "Task import not found" });
    }

    // Fetch tasks from external service
    const service = TaskImportServiceFactory.createService(
      taskImport.provider,
      taskImport.credentials
    );
    const externalTasks = await service.fetchTasks();

    // Process and import tasks
    let imported = 0;
    let skipped = 0;

    for (const externalTask of externalTasks) {
      // Check for duplicates by external_id or title
      const existingTask = await taskRepository.findOne({
        where: [
          { external_id: externalTask.id, user: { id: user.id } },
          { title: externalTask.title, user: { id: user.id } },
        ],
      });

      if (existingTask) {
        skipped++;
        continue;
      }

      // Find or create category
      let category = null;
      if (externalTask.category) {
        category = await categoryRepository.findOne({
          where: { name: externalTask.category, user: { id: user.id } },
        });
        if (!category) {
          category = categoryRepository.create({
            name: externalTask.category,
            user,
          });
          await categoryRepository.save(category);
        }
      }

      // Create task
      const task = taskRepository.create({
        title: externalTask.title,
        description: externalTask.description,
        due_date: externalTask.due_date,
        priority: externalTask.priority,
        status: externalTask.status,
        external_id: externalTask.id,
        user,
        category: category || undefined,
      });

      await taskRepository.save(task);
      imported++;
    }

    // Record import history
    const history = importHistoryRepository.create({
      provider: taskImport.provider,
      imported_at: new Date(),
      tasks_imported: imported,
      tasks_skipped: skipped,
      status: imported > 0 ? ImportStatus.SUCCESS : skipped > 0 ? ImportStatus.PARTIAL : ImportStatus.SUCCESS,
      user,
    });

    await importHistoryRepository.save(history);

    res.json({
      message: `Imported ${imported} tasks, skipped ${skipped} duplicates`,
      imported,
      skipped,
    });
  } catch (error) {
    // Record failed import
    const user = req.user!;
    const { importId } = req.params;
    const taskImport = await taskImportRepository.findOne({
      where: { id: parseInt(importId), user: { id: user.id } },
    });

    if (taskImport) {
      const history = importHistoryRepository.create({
        provider: taskImport.provider,
        imported_at: new Date(),
        tasks_imported: 0,
        tasks_skipped: 0,
        status: ImportStatus.FAILED,
        error_message: error instanceof Error ? error.message : "Unknown error",
        user,
      });
      await importHistoryRepository.save(history);
    }

    res.status(500).json({ error: "Failed to import tasks" });
  }
});

// Get import history
router.get("/history", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const history = await importHistoryRepository.find({
      where: { user: { id: user.id } },
      order: { imported_at: "DESC" },
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to get import history" });
  }
});

export default router;
