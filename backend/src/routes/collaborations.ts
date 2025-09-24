import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Collaboration } from "../entities/Collaboration";
import { Task } from "../entities/Task";
import { Event } from "../entities/Event";
import { User } from "../entities/User";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const collaborationRepository = AppDataSource.getRepository(Collaboration);
const taskRepository = AppDataSource.getRepository(Task);
const eventRepository = AppDataSource.getRepository(Event);
const userRepository = AppDataSource.getRepository(User);

// Get collaborations for user's tasks and events
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const collaborations = await collaborationRepository.find({
      where: { user: { id: user.id } },
      relations: ["task", "event", "user"],
    });
    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get collaborations" });
  }
});

// Add collaborator to task or event
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { resource_type, resource_id, collaborator_email, role } = req.body;

    if (!["task", "event"].includes(resource_type)) {
      return res.status(400).json({ error: "Invalid resource type" });
    }

    let resource;
    if (resource_type === "task") {
      resource = await taskRepository.findOne({
        where: { id: resource_id, user: { id: user.id } },
      });
    } else {
      resource = await eventRepository.findOne({
        where: { id: resource_id, user: { id: user.id } },
      });
    }

    if (!resource) {
      return res
        .status(404)
        .json({ error: "Resource not found or access denied" });
    }

    // Find collaborator
    const collaborator = await userRepository.findOne({
      where: { email: collaborator_email },
    });

    if (!collaborator) {
      return res.status(404).json({ error: "Collaborator not found" });
    }

    // Check if collaboration already exists
    const existingCollaboration = await collaborationRepository.findOne({
      where:
        resource_type === "task"
          ? { task: { id: resource_id }, user: { id: collaborator.id } }
          : { event: { id: resource_id }, user: { id: collaborator.id } },
    });

    if (existingCollaboration) {
      return res.status(400).json({ error: "Collaboration already exists" });
    }

    const collaboration = collaborationRepository.create({
      [resource_type]: resource,
      user: collaborator,
      role: role || "write",
    });

    await collaborationRepository.save(collaboration);
    res.status(201).json(collaboration);
  } catch (error) {
    res.status(500).json({ error: "Failed to add collaborator" });
  }
});

// Remove collaborator
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const collaboration = await collaborationRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["task", "event"],
    });

    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration not found" });
    }

    // Check if user owns the resource or is the collaborator
    const ownerId = collaboration.task ? collaboration.task.user.id : collaboration.event!.user.id;
    if (ownerId !== user.id && collaboration.user.id !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await collaborationRepository.remove(collaboration);
    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove collaborator" });
  }
});

export default router;
