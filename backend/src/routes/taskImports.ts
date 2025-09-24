import { Router } from "express";
import { AppDataSource } from "../data-source";
import { TaskImport } from "../entities/TaskImport";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { TaskImportServiceFactory } from "../services/taskImport/TaskImportServiceFactory";

const router = Router();
const taskImportRepository = AppDataSource.getRepository(TaskImport);

// @ts-ignore
router.get("/", authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user!;
    const imports = await taskImportRepository.find({
      where: { user: { id: user.id } },
    });
    res.json(imports);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task imports" });
  }
});

// @ts-ignore
router.post("/", authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user!;
    const { provider, credentials } = req.body;

    // Check if already exists
    const existing = await taskImportRepository.findOne({
      where: { provider, user: { id: user.id } },
    });

    if (existing) {
      return res.status(400).json({ error: "Provider already connected" });
    }

    // Validate credentials
    const service = TaskImportServiceFactory.createService(
      provider,
      credentials
    );
    const isValid = await service.authenticate(credentials);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const taskImport = taskImportRepository.create({
      provider,
      credentials, // In production, encrypt this
      user,
    });

    await taskImportRepository.save(taskImport);
    res.status(201).json(taskImport);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task import" });
  }
});

// @ts-ignore
router.put("/:id", authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { credentials } = req.body;

    const taskImport = await taskImportRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } },
    });

    if (!taskImport) {
      return res.status(404).json({ error: "Task import not found" });
    }

    // Validate new credentials
    const service = TaskImportServiceFactory.createService(
      taskImport.provider,
      credentials
    );
    const isValid = await service.authenticate(credentials);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    taskImport.credentials = credentials;
    await taskImportRepository.save(taskImport);
    res.json(taskImport);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task import" });
  }
});

// @ts-ignore
router.delete("/:id", authenticateToken, async (req: Request, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const taskImport = await taskImportRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } },
    });

    if (!taskImport) {
      return res.status(404).json({ error: "Task import not found" });
    }

    await taskImportRepository.remove(taskImport);
    res.json({ message: "Task import disconnected" });
  } catch (error) {
    res.status(500).json({ error: "Failed to disconnect task import" });
  }
});

export default router;
