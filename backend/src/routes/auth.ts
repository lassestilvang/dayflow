import { Router, Request, Response } from "express";
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
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      // Save user to database
      const savedUser = await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
        },
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
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
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
router.get("/google", (req: Request, res: Response) => {
  // Placeholder for OAuth2 implementation
  res.json({ message: "OAuth2 Google login not implemented yet" });
});

export default router;
