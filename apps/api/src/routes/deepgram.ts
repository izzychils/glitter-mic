import { Router } from "express";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/deepgram/token
 * Returns the Deepgram API key for client-side use
 * In production, you should implement proper token scoping
 */
router.get("/token", requireAuth, async (_req, res) => {
  try {
    // For now, return the API key directly
    // In production, implement Deepgram's temporary key API
    res.json({
      token: env.DEEPGRAM_API_KEY,
      expiresIn: 3600,
    });
  } catch (error) {
    logger.error("Failed to get Deepgram token", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get API token",
    });
  }
});

export default router;
