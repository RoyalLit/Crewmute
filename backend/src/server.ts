/**
 * Server entry point.
 *
 * Responsibilities:
 *   1. Load .env (must be first — before any other import reads process.env)
 *   2. Validate environment configuration (env.ts throws if required vars missing)
 *   3. Connect to MongoDB
 *   4. Start the HTTP server
 *   5. Register graceful shutdown handlers
 *
 * This file is intentionally thin. All application setup is in app.ts.
 */

import 'dotenv/config';

import { createApp } from './app';
import env from './config/env';
import { connectDB, registerShutdownHandlers } from './db/connection';
import logger from './shared/logger';

import { initializeSockets } from './features/chats/socket';

async function start(): Promise<void> {
  // Log startup configuration (no secrets) per AGENT_RULES.md §21.1
  logger.info(
    {
      nodeEnv: env.nodeEnv,
      port: env.port,
    },
    'Starting Crewmute API server'
  );

  // Connect to MongoDB before accepting traffic
  await connectDB();

  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, `Crewmute API listening on port ${env.port}`);
  });

  // Attach socket.io
  initializeSockets(server);

  // Register SIGTERM/SIGINT handlers for graceful shutdown
  registerShutdownHandlers();

  // Handle unhandled promise rejections — log and exit
  // Allows Railway to detect and restart the process
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection — shutting down');
    server.close(() => process.exit(1));
  });
}

// Top-level await not available in CommonJS — use .catch to surface startup errors
start().catch((err: unknown) => {
  // Intentional console.error here — logger may not be initialized if config loading failed
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
