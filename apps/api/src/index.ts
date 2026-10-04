import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { attachSockets } from "./sockets";

const app = createApp();
const httpServer = createServer(app);
attachSockets(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`Glitter Mic API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  logger.info(`CORS origin: ${env.CLIENT_ORIGIN}`);
  logger.info("Realtime: Socket.IO attached (clock:ping ready)");
});
