/**
 * Root Express router.
 *
 * Mounts:
 *   GET /health       — liveness probe (process is running)
 *   GET /health/ready — readiness probe (DB connected, ready for traffic)
 *
 * Feature routes are mounted here as they are added in subsequent PRs:
 *   router.use('/auth', authRoutes);
 *   router.use('/users', userRoutes);
 *   router.use('/rides', rideRoutes);
 *   etc.
 *
 * Health endpoints are exempt from auth middleware and rate limiting
 * per AGENT_RULES.md §21.2.
 */

import { Router, type Request, type Response } from 'express';

import { isDatabaseConnected } from '../db/connection';

// TODO(feature/auth): mount authRoutes when auth feature is implemented
// TODO(feature/users): mount userRoutes when users feature is implemented
// TODO(feature/rides): mount rideRoutes when rides feature is implemented
// TODO(feature/requests): mount requestRoutes when requests feature is implemented
// TODO(feature/chats): mount chatRoutes when chats feature is implemented

const router = Router();

// ── Liveness probe ────────────────────────────────────────────────────────────
// Returns 200 as long as the Node.js process is running.
// Used by Railway keep-alive and UptimeRobot (ARCHITECTURE.md §9.3).
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Readiness probe ───────────────────────────────────────────────────────────
// Returns 200 only when the database connection is healthy.
// Kubernetes / Railway can use this to gate traffic.
router.get('/health/ready', (_req: Request, res: Response): void => {
  if (isDatabaseConnected()) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
    });
  }
});

export default router;
