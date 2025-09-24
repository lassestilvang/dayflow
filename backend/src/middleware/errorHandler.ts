import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    res.status(400).json({ error: "Validation Error", details: err.message });
    return;
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(500).json({ error: "Internal Server Error" });
};
