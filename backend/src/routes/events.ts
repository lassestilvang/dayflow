import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Event } from "../entities/Event";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  validateEvent,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();
const eventRepository = AppDataSource.getRepository(Event);

// Get all events for user (owned and shared)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const events = await eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.collaborations", "collaboration")
      .leftJoinAndSelect("collaboration.user", "collaborator")
      .where("event.userId = :userId", { userId: user.id })
      .orWhere("collaboration.userId = :userId", { userId: user.id })
      .orderBy("event.start_time", "ASC")
      .getMany();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to get events" });
  }
});

// Create event
router.post(
  "/",
  authenticateToken,
  validateEvent,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { title, description, start_time, end_time, location } = req.body;

      const event = eventRepository.create({
        title,
        description,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        location,
        user,
      });

      await eventRepository.save(event);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

// Update event
router.put(
  "/:id",
  authenticateToken,
  validateEvent,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { title, description, start_time, end_time, location } = req.body;

      const event = await eventRepository.findOne({
        where: { id: parseInt(id), user: { id: user.id } },
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      event.title = title || event.title;
      event.description =
        description !== undefined ? description : event.description;
      event.start_time = start_time ? new Date(start_time) : event.start_time;
      event.end_time = end_time ? new Date(end_time) : event.end_time;
      event.location = location !== undefined ? location : event.location;

      await eventRepository.save(event);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

// Delete event
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const event = await eventRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await eventRepository.remove(event);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
