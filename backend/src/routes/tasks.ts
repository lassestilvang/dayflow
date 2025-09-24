import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { Event } from "../entities/Event";
import { Category } from "../entities/Category";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { validateTask, handleValidationErrors } from "../middleware/validation";
import { NLPService, ParsedTask } from "../services/nlpService";
import { SchedulingService, TimeSlot } from "../services/schedulingService";

const router = Router();
const taskRepository = AppDataSource.getRepository(Task);
const eventRepository = AppDataSource.getRepository(Event);
const categoryRepository = AppDataSource.getRepository(Category);

// Get all tasks for user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const tasks = await taskRepository.find({
      where: { user: { id: user.id } },
      relations: ["category", "subtasks"],
      order: { created_at: "DESC" },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

// Create task
router.post(
  "/",
  authenticateToken,
  validateTask,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { title, description, due_date, priority, status, category_id } =
        req.body;

      let category = null;
      if (category_id) {
        category = await categoryRepository.findOne({
          where: { id: category_id, user: { id: user.id } },
        });
        if (!category) {
          return res.status(400).json({ error: "Invalid category" });
        }
      }

      const task = taskRepository.create({
        title,
        description,
        due_date: due_date ? new Date(due_date) : undefined,
        priority,
        status,
        user,
        category: category || undefined,
      });

      await taskRepository.save(task);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  }
);

// Update task
router.put(
  "/:id",
  authenticateToken,
  validateTask,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { title, description, due_date, priority, status, category_id } =
        req.body;

      const task = await taskRepository.findOne({
        where: { id: parseInt(id), user: { id: user.id } },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      let category = null;
      if (category_id) {
        category = await categoryRepository.findOne({
          where: { id: category_id, user: { id: user.id } },
        });
        if (!category) {
          return res.status(400).json({ error: "Invalid category" });
        }
      }

      task.title = title || task.title;
      task.description =
        description !== undefined ? description : task.description;
      task.due_date = due_date ? new Date(due_date) : task.due_date;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.category = category !== undefined ? category : task.category;

      await taskRepository.save(task);
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  }
);

// Delete task
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await taskRepository.remove(task);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Parse natural language input
router.post("/parse-nlp", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Input text is required" });
    }

    const parsed = NLPService.parseTask(input);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: "Failed to parse input" });
  }
});

// Create task/event from parsed NLP
router.post(
  "/create-from-nlp",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { input } = req.body;

      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Input text is required" });
      }

      const parsed = NLPService.parseTask(input);

      if (parsed.isEvent) {
        // Create event
        const event = eventRepository.create({
          title: parsed.title,
          description: parsed.description,
          start_time: parsed.start_time!,
          end_time: parsed.end_time!,
          location: parsed.location,
          rrule: parsed.rrule,
          user,
        });

        await eventRepository.save(event);
        res.status(201).json({ type: "event", data: event });
      } else {
        // Create task
        const task = taskRepository.create({
          title: parsed.title,
          description: parsed.description,
          due_date: parsed.due_date,
          priority: parsed.priority,
          rrule: parsed.rrule,
          user,
        });

        await taskRepository.save(task);
        res.status(201).json({ type: "task", data: task });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create task/event" });
    }
  }
);

// Get scheduling suggestions
router.post(
  "/scheduling-suggestions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { start_time, end_time, duration_minutes } = req.body;

      if (!start_time || !end_time) {
        return res
          .status(400)
          .json({ error: "Start time and end time are required" });
      }

      const preferredTime: TimeSlot = {
        start: new Date(start_time),
        end: new Date(end_time),
      };

      const suggestions = await SchedulingService.findAvailableSlots(
        user,
        preferredTime,
        duration_minutes || 60
      );

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get scheduling suggestions" });
    }
  }
);

export default router;
