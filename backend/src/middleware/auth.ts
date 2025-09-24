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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
    };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};
