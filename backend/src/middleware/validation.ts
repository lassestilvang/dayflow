import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateUserRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().isLength({ min: 1 }),
];

export const validateUserLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
];

export const validateTask = [
  body("title").trim().isLength({ min: 1 }),
  body("description").optional().isString(),
  body("due_date").optional().isISO8601(),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("status").optional().isIn(["pending", "in_progress", "completed"]),
  body("category_id").optional().isInt(),
  body("rrule").optional().isString(),
];

export const validateEvent = [
  body("title").trim().isLength({ min: 1 }),
  body("description").optional().isString(),
  body("start_time").isISO8601(),
  body("end_time").isISO8601(),
  body("location").optional().isString(),
  body("rrule").optional().isString(),
];

export const validateCategory = [
  body("name").trim().isLength({ min: 1 }),
  body("color").optional().isHexColor(),
];
