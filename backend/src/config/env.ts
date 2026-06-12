/**
 * Environment variable validation and typed configuration.
 *
 * This module reads process.env at startup and throws a plain Error
 * (not an AppError) if any required variable is missing. The server
 * will refuse to start with an incomplete configuration.
 *
 * All application code must import config from this module — never
 * access process.env directly elsewhere.
 */

interface Config {
  readonly port: number;
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly mongoUri: string;
  readonly accessTokenSecret: string;
  readonly refreshTokenSecret: string;
  readonly email: {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly pass: string;
  };
  readonly cloudinary: {
    readonly cloudName: string;
    readonly apiKey: string;
    readonly apiSecret: string;
  };
  readonly clientUrl: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[config] Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function parseNodeEnv(value: string): 'development' | 'production' | 'test' {
  if (value === 'production' || value === 'test' || value === 'development') {
    return value;
  }
  return 'development';
}

// Validate and build config on module load. Fail fast on missing required vars.
// This is intentionally a plain Error — it fires before AppError is useful.
const env: Config = Object.freeze({
  port: parseInt(optionalEnv('PORT', '5000'), 10),
  nodeEnv: parseNodeEnv(optionalEnv('NODE_ENV', 'development')),
  mongoUri: requireEnv('MONGO_URI'),
  accessTokenSecret: requireEnv('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: requireEnv('REFRESH_TOKEN_SECRET'),
  email: {
    host: optionalEnv('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(optionalEnv('EMAIL_PORT', '587'), 10),
    user: optionalEnv('EMAIL_USER', ''),
    pass: optionalEnv('EMAIL_PASS', ''),
  },
  cloudinary: {
    cloudName: optionalEnv('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optionalEnv('CLOUDINARY_API_KEY', ''),
    apiSecret: optionalEnv('CLOUDINARY_API_SECRET', ''),
  },
  clientUrl: optionalEnv('CLIENT_URL', '*'),
});

export default env;
