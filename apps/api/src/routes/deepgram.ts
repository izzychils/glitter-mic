import { Router } from "express";
import { createClient, DeepgramClient } from "@deepgram/sdk";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Initialize Deepgram client
const deepgram: DeepgramClient = createClient(env.DEEPGRAM_API_KEY);

/**
 * GET /api/deepgram/token
 * Get a temporary Deepgram token for client-side streaming
 */
router.get("/token", requireAuth, async (req, res) => {
  try {
    // Generate a temporary token for the client
    const token = await deepgram.manage.createProjectKey(
      env.DEEPGRAM_PROJECT_ID || "",
      {
        comment: `Temp token for user ${req.session.userId}`,
        scopes: ["usage:write"],
        time_to_live_in_seconds: 3600, // 1 hour
      }
    );

    res.json({
      token: token.key,
      expiresIn: 3600,
    });
  } catch (error) {
    logger.error("Failed to create Deepgram token", error);
    
    // Fallback: return the main API key (not recommended for production)
    res.json({
      token: env.DEEPGRAM_API_KEY,
      expiresIn: 3600,
      fallback: true,
    });
  }
});

/**
 * POST /api/deepgram/transcribe
 * Transcribe audio data (for pre-recorded audio)
 */
router.post("/transcribe", requireAuth, async (req, res) => {
  try {
    const { audioUrl } = req.body;

    if (!audioUrl) {
      return res.status(400).json({
        error: "Missing audio URL",
        message: "audioUrl is required",
      });
    }

    const { result } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl,
      },
      {
        model: "nova-2",
        language: "en",
        punctuate: true,
        utterances: true,
        smart_format: true,
      }
    );

    res.json({
      transcript: result.results.channels[0].alternatives[0].transcript,
      words: result.results.channels[0].alternatives[0].words,
      utterances: result.results.utterances,
    });
  } catch (error) {
    logger.error("Failed to transcribe audio", error);
    res.status(500).json({
      error: "Transcription failed",
      message: "Could not transcribe audio",
    });
  }
});

export default router;
