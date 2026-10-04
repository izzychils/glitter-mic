import { Router } from "express";
import { z } from "zod";
import * as userRepo from "../repositories/userRepository";
import { toPublicUser } from "../models/user";
import { logger } from "../lib/logger";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  displayName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post("/signup", async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, username, password, displayName } = parsed.data;

    // Check if email already exists
    if (await userRepo.emailExists(email)) {
      return res.status(409).json({
        error: "Email already registered",
        message: "An account with this email already exists",
      });
    }

    // Check if username already exists
    if (await userRepo.usernameExists(username)) {
      return res.status(409).json({
        error: "Username already taken",
        message: "This username is not available",
      });
    }

    // Create user
    const user = await userRepo.createUser({
      email,
      username,
      password,
      display_name: displayName,
    });

    // Log user in immediately
    req.session.userId = user.id;
    req.session.username = user.username;

    // Force session save before responding (important for cross-origin)
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await userRepo.updateLastLogin(user.id);

    logger.info(`User signed up and logged in: ${user.username}, sessionId: ${req.sessionID}`);

    res.status(201).json({
      message: "Account created successfully",
      user: toPublicUser(user),
      sessionId: req.sessionID, // Send session ID for localStorage backup
    });
  } catch (error) {
    logger.error("Signup error", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create account",
    });
  }
});

/**
 * POST /api/auth/login
 * Log in with email and password
 */
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await userRepo.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Verify password
    const isValid = await userRepo.verifyPassword(user, password);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: "Account disabled",
        message: "Your account has been disabled",
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Force session save before responding (important for cross-origin)
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await userRepo.updateLastLogin(user.id);

    logger.info(`User logged in: ${user.username}, sessionId: ${req.sessionID}`);

    res.json({
      message: "Logged in successfully",
      user: toPublicUser(user),
      sessionId: req.sessionID, // Send session ID for localStorage backup
    });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to log in",
    });
  }
});

/**
 * POST /api/auth/logout
 * Log out the current user
 */
router.post("/logout", (req, res) => {
  const username = req.session?.username;

  // If no session exists, just return success
  if (!req.session || !req.session.userId) {
    res.clearCookie("glitter.sid");
    return res.json({
      message: "Already logged out",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error("Logout error", err);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to log out",
      });
    }

    res.clearCookie("glitter.sid");
    logger.info(`User logged out: ${username}`);

    res.json({
      message: "Logged out successfully",
    });
  });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await userRepo.findUserById(req.session.userId!);

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        error: "User not found",
        message: "Your session is invalid",
      });
    }

    res.json({
      user: toPublicUser(user),
    });
  } catch (error) {
    logger.error("Get user error", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get user info",
    });
  }
});

/**
 * GET /api/auth/session
 * Check if user is authenticated
 */
router.get("/session", (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      username: req.session.username,
    });
  } else {
    res.json({
      authenticated: false,
    });
  }
});

/**
 * GET /api/auth/debug
 * Debug endpoint to check session and cookie configuration
 */
router.get("/debug", (req, res) => {
  res.json({
    hasSession: !!req.session,
    sessionId: req.sessionID,
    userId: req.session?.userId,
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      cookie: req.headers.cookie,
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      clientOrigin: process.env.CLIENT_ORIGIN,
    },
  });
});

export default router;
