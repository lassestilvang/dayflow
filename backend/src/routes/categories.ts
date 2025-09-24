import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  validateCategory,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();
const categoryRepository = AppDataSource.getRepository(Category);

// Get all categories for user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const categories = await categoryRepository.find({
      where: { user: { id: user.id } },
      order: { created_at: "DESC" },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// Create category
router.post(
  "/",
  authenticateToken,
  validateCategory,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { name, color } = req.body;

      const category = categoryRepository.create({
        name,
        color,
        user,
      });

      await categoryRepository.save(category);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);

// Update category
router.put(
  "/:id",
  authenticateToken,
  validateCategory,
  handleValidationErrors,
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { name, color } = req.body;

      const category = await categoryRepository.findOne({
        where: { id: parseInt(id), user: { id: user.id } },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      category.name = name || category.name;
      category.color = color !== undefined ? color : category.color;

      await categoryRepository.save(category);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

// Delete category
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const category = await categoryRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await categoryRepository.remove(category);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
