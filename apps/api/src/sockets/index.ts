import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

/**
 * Realtime layer (build guide Section 7).
 *
 * Implemented now:
 *  - clock:ping  -> ack with the server clock so clients can estimate their offset
 *
 * Later phases add: room:join/leave/ready/chat, game:start, score:tick,
 * game:finish, reaction:send, plus cookie-based socket authentication.
 */
export function attachSockets(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
  });

  io.use((_socket, next) => {
    // Phase 2 will verify the same httpOnly session cookie used by REST here,
    // so every socket event is tied to a verified user id.
    next();
  });

  io.on("connection", (socket) => {
    logger.info(`socket connected: ${socket.id}`);

    // Section 7.2 - clients run 8 ping rounds and take the median offset.
    socket.on("clock:ping", (ack?: (serverTime: number) => void) => {
      if (typeof ack === "function") ack(Date.now());
    });

    socket.on("disconnect", (reason) => {
      logger.info(`socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
