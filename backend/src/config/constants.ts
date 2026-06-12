/**
 * Application-wide named constants.
 *
 * All magic numbers and strings must live here with a descriptive name.
 * AGENT_RULES.md §3.4: magic numbers and strings without named constants are forbidden.
 *
 * Do NOT import env here — constants are pure values with no external dependencies.
 */

export const TOKEN = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
  OTP_EXPIRY_MINUTES: 10,
  OTP_LENGTH: 6,
} as const;

export const AUTH = {
  BCRYPT_SALT_ROUNDS: 12, // Must check ownership before status — see PRD §5.1 / ARCHITECTURE.md §6.1
  REFRESH_TOKEN_ARRAY_MAX: 10, // Per-user refresh token limit (multi-device cap)
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100, // Enforced per AGENT_RULES.md §11.4: unbounded queries are forbidden
} as const;

export const RATE_LIMIT = {
  // Auth endpoints: stricter limits per AGENT_RULES.md §19.4
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 10,
  // General endpoints
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX_REQUESTS: 100,
} as const;

export const RIDE = {
  MIN_SEATS: 1,
  MAX_SEATS: 6,
  NOTES_MAX_LENGTH: 200,
  EXPIRY_CRON: '*/30 * * * *', // Every 30 minutes — ARCHITECTURE.md §7.3
} as const;

export const REQUEST = {
  MESSAGE_MAX_LENGTH: 100,
} as const;

export const MESSAGE = {
  CONTENT_MAX_LENGTH: 1000,
} as const;

export const HEALTH = {
  READY_PATH: '/health/ready',
  LIVE_PATH: '/health',
} as const;
