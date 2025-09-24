import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user!;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  }
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email } = req.body;
      const user = req.user!;

      if (name) user.name = name;
      if (email) user.email = email;

      await userRepository.save(user);

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
