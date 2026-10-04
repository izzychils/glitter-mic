import { Router } from "express";
import { healthRouter } from "./health";
import authRouter from "./auth";
import songsRouter from "./songs";
import deepgramRouter from "./deepgram";

/**
 * All REST routes are mounted under /api.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/songs", songsRouter);
apiRouter.use("/deepgram", deepgramRouter);

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "Glitter Mic API",
    stage: "Production Ready",
    implemented: [
      "GET /api/health",
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/me",
      "GET /api/auth/session",
      "GET /api/songs",
      "GET /api/songs/:id",
      "GET /api/songs/meta/genres",
      "GET /api/deepgram/token",
      "POST /api/deepgram/transcribe",
    ],
    planned: [
      "POST /api/sessions/submit",
      "GET /api/leaderboards/*",
    ],
    realtime: {
      transport: "Socket.IO",
      implemented: ["clock:ping"],
      planned: ["room:join", "room:ready", "game:start", "score:tick", "game:finish", "reaction:send"],
    },
  });
});
