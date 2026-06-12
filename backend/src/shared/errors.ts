/**
 * Centralized typed error hierarchy.
 *
 * All application errors extend AppError. The error handler middleware
 * (middleware/errorHandler.ts) uses instanceof checks on this hierarchy
 * to produce correctly structured API responses.
 *
 * Per AGENT_RULES.md §20.1 — this is the exact mandated structure.
 * Services throw these errors; controllers do not catch them (the central
 * error handler does).
 */

/**
 * Base application error. All domain errors extend this class.
 * The `code` field is a machine-readable SCREAMING_SNAKE_CASE identifier
 * per AGENT_RULES.md §11.2.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    // Operational errors are expected failures (not bugs); they are logged
    // at warn level rather than error level.
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 — Resource not found.
 * Usage: throw new NotFoundError('MuteRequest', id)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' was not found.` : `${resource} was not found.`;
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 403 — Forbidden. The authenticated user cannot perform this action.
 * Usage: throw new ForbiddenError('cancel this ride')
 */
export class ForbiddenError extends AppError {
  constructor(action: string) {
    super('FORBIDDEN', `You are not permitted to ${action}.`, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 401 — Unauthenticated. No valid session.
 * Usage: throw new UnauthorizedError()
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required. Please log in.') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 409 — Conflict. Duplicate resource or invalid state transition.
 * Usage: throw new ConflictError('A request for this ride already exists.')
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 400 — Validation error with optional field-level details.
 * Typically produced by the validate middleware, not thrown directly.
 * Usage: throw new ValidationError('Invalid input.', { email: 'Must be a valid email.' })
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}
