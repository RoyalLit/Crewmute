/**
 * Server entry point.
 *
 * Responsibilities:
 *   1. Load .env (must be first — before any other import reads process.env)
 *   2. Validate environment configuration (env.ts throws if required vars missing)
 *   3. Connect to MongoDB
 *   4. Start the HTTP server
 *   5. Register graceful shutdown handlers
 *   6. Initialize Sentry error tracking (H13)
 *
 * This file is intentionally thin. All application setup is in app.ts.
 */

import 'dotenv/config';

import { createApp } from './app';
import env from './config/env';
import { connectDB, registerShutdownHandlers, setHttpServer } from './db/connection';
import { initializeSockets } from './features/chats/socket';
import { startRideExpiryCron } from './features/rides/rides.cron';
import logger from './shared/logger';

async function start(): Promise<void> {
  // Initialize Sentry before any other services
  if (env.sentryDsn) {
    const Sentry = await import('@sentry/node');
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.nodeEnv,
      tracesSampleRate: 0.2,
    });
  }

  // Log startup configuration (no secrets)
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

  // Start ride expiry cron job per ARCHITECTURE.md §7.3
  // Only runs on instances with CRON_ENABLED=true (singleton guard for multi-instance deployments)
  if (env.cronEnabled) {
    startRideExpiryCron();
  }

  // Register HTTP server for graceful shutdown
  setHttpServer(server);

  // Register SIGTERM/SIGINT handlers for graceful shutdown
  registerShutdownHandlers();

  // Handle unhandled promise rejections — log and exit
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection — shutting down');
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions — log, attempt graceful close, then exit
  process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception — shutting down');
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
