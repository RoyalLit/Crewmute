/**
 * Express application factory.
 *
 * Creates and configures the Express app without starting the HTTP server.
 * Keeping the app factory separate from server.ts makes the app fully testable
 * (Supertest can import this without binding to a port).
 *
 * Middleware order matters. This is the enforced order:
 *   1. Security headers (helmet)
 *   2. CORS
 *   3. Request logging (pino-http)
 *   4. Body parsers
 *   5. Rate limiting (configured per-route group, not globally)
 *   6. Routes
 *   7. 404 handler
 *   8. Error handler (must be last — 4 arguments)
 */

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import env from './config/env';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import requestLogger from './middleware/requestLogger';
import router from './routes/index';

export function createApp(): express.Application {
  const app = express();

  // ── 1. Security headers ─────────────────────────────────────────────────
  // Helmet sets secure HTTP headers (XSS protection, content-type sniffing, etc.)
  // per ARCHITECTURE.md §10 security checklist.
  app.use(helmet());

  // ── 2. CORS ─────────────────────────────────────────────────────────────
  // Restricted to the mobile app origin in production.
  app.use(
    cors({
      origin: env.clientUrl === '*' ? '*' : env.clientUrl,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: env.clientUrl !== '*',
    })
  );

  // ── 3. Request logging ──────────────────────────────────────────────────
  app.use(requestLogger);

  // ── 4. Body parsers ─────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── 5–6. Routes (rate limiting is applied per feature route group) ──────
  app.use('/api/v1', router);

  // ── 7. 404 handler (after all routes) ───────────────────────────────────
  app.use(notFound);

  // ── 8. Centralized error handler (must be last, 4 arguments) ────────────
  app.use(errorHandler);

  return app;
}
