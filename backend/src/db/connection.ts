/**
 * MongoDB connection management via Mongoose.
 *
 * connectDB()    — establishes the connection, logs result, registers event handlers.
 * disconnectDB() — graceful disconnect used in tests and shutdown handlers.
 *
 * Signal handlers (SIGTERM, SIGINT) are registered here to ensure graceful
 * shutdown — the server stops accepting requests before closing the DB connection.
 *
 * Per AGENT_RULES.md §21.1: "Application startup logs the loaded configuration
 * (without secrets) and confirms external service connectivity."
 */

import mongoose from 'mongoose';

import env from '../config/env';
import logger from '../shared/logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    logger.warn('connectDB called but MongoDB is already connected — skipping.');
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      // Mongoose 8.x defaults are sensible; no poolSize override needed for MVP
    });

    isConnected = true;
    logger.info(
      {
        // Log database name but never the full URI (contains credentials)
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      'MongoDB connected successfully'
    );
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    // Re-throw so the server entry point can decide whether to exit
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

export function isDatabaseConnected(): boolean {
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  return mongoose.connection.readyState === 1;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Register once. Guards against duplicate handler registration in hot-reload.
let shutdownHandlersRegistered = false;

export function registerShutdownHandlers(): void {
  if (shutdownHandlersRegistered) return;
  shutdownHandlersRegistered = true;

  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutdown signal received — closing MongoDB connection');
    await disconnectDB();
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

// ── Mongoose connection event logging ────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB connection error');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('MongoDB reconnected');
});
