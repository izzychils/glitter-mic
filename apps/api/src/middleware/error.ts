import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Not found", path: req.path });
}

/** Central error boundary: Zod issues become 400s, everything else stays a 500. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.flatten() });
    return;
  }
  logger.error("Unhandled request error", err);
  res.status(500).json({ error: "Internal server error" });
}
