/**
 * Shared TypeScript types used across the backend.
 *
 * Feature-specific types live in features/<name>/<feature>.types.ts.
 * Only types that are genuinely cross-cutting belong here.
 */

import type { Request } from 'express';

/**
 * Authenticated user payload attached to the request by auth middleware.
 * Services and controllers reference req.user as this type.
 */
export interface RequestUser {
  id: string;
  email: string;
}

/**
 * Express Request extended with an authenticated user.
 * Use AuthenticatedRequest in protected route handlers.
 */
export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

/**
 * Generic paginated result returned from repositories.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Query parameters common to all paginated list endpoints.
 * Per AGENT_RULES.md §11.4.
 */
export interface PaginationQuery {
  page: number;
  pageSize: number;
}
