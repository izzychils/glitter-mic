import { Request, Response, NextFunction } from "express";

/**
 * Middleware to protect routes that require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "You must be logged in to access this resource",
    });
  }
  next();
}

/**
 * Middleware to attach user info to request if authenticated
 * Currently a pass-through since session data is already attached by express-session
 */
export function optionalAuth(_req: Request, _res: Response, next: NextFunction) {
  // Session data is already attached by express-session
  next();
}
