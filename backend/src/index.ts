import "reflect-metadata";
import express from "express";
import cors from "cors";
import passport from "./config/passport";
import { AppDataSource } from "./data-source";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";
import eventRoutes from "./routes/events";
import categoryRoutes from "./routes/categories";
import collaborationRoutes from "./routes/collaborations";
import calendarRoutes from "./routes/calendars";
import taskImportRoutes from "./routes/taskImports";
import importRoutes from "./routes/import";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Initialize database
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => console.log("Database connection error:", error));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/calendars", calendarRoutes);
app.use("/api/task-imports", taskImportRoutes);
app.use("/api/import", importRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Daily Planner API" });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
