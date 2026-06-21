/**
 * HTTP request logging middleware using pino-http.
 *
 * Logs every request with: method, path, status code, duration, and requestId.
 * Per .
 *
 * The requestId is generated per-request and attached to req.headers so that
 * subsequent log entries in the same request lifecycle can correlate.
 */

import { randomUUID } from 'crypto';

import pinoHttp from 'pino-http';

import env from '../config/env';
import logger from '../shared/logger';

const requestLogger = pinoHttp({
  logger,
  // Generate a unique request ID for each request
  genReqId: (req) => {
    const existingId = req.headers['x-request-id'];
    if (existingId) return existingId as string;
    const id = randomUUID();
    req.headers['x-request-id'] = id;
    return id;
  },
  // Custom log level per status code
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Log API response time customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  // Only log in non-test environments to keep test output clean
  enabled: env.nodeEnv !== 'test',
  // Redact auth headers from request logs
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

export default requestLogger;
