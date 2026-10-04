import { Router } from "express";
import { healthRouter } from "./health";

/**
 * All REST routes are mounted under /api.
 * Later phases add: /auth, /songs, /sessions, /leaderboards, /stt, /rooms
 * (build guide Section 10).
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "Glitter Mic API",
    stage: "Phase 1 - scaffold",
    implemented: ["GET /api/health"],
    planned: [
      "POST /api/auth/google",
      "GET /api/songs",
      "GET /api/songs/:id/lyrics",
      "POST /api/sessions/submit",
      "GET /api/leaderboards/*",
      "GET /api/stt/token",
    ],
    realtime: {
      transport: "Socket.IO",
      implemented: ["clock:ping"],
      planned: ["room:join", "room:ready", "game:start", "score:tick", "game:finish", "reaction:send"],
    },
  });
});
