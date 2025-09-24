import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Register
router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      await userRepository.save(user);

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// Login
router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// OAuth2 placeholder (Google)
router.get("/google", (req, res) => {
  // Placeholder for OAuth2 implementation
  res.json({ message: "OAuth2 Google login not implemented yet" });
});

export default router;
