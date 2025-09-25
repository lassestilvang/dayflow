import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      password: string;
      name: string;
      created_at: Date;
      updated_at: Date;
      tasks: any[];
      events: any[];
      categories: any[];
      taskImports: any[];
      importHistory: any[];
      collaborations: any[];
      calendarIntegrations: any[];
    }
  }
}

export type AuthRequest = Request;

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Auth middleware: Checking token");
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    console.log("Extracted token:", token ? "present" : "missing");

    if (!token) {
      console.log("Auth middleware: No token provided");
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
    };
    console.log("Decoded token userId:", decoded.userId);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });
    console.log("User found in DB:", user ? "yes" : "no");

    if (!user) {
      console.log("Auth middleware: User not found for id:", decoded.userId);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user;
    console.log("Auth middleware: Token validated successfully");
    next();
  } catch (error) {
    console.log("Auth middleware: Token verification failed:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};
