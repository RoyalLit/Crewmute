/**
 * express-validator result checker middleware.
 *
 * Attach this after a validator chain in a route to check for validation
 * errors and short-circuit with a 400 response before the controller runs.
 *
 * Per AGENT_RULES.md §9.6: validation is the controller's responsibility
 * (enforced via the route → validator chain → this middleware → controller
 * pattern). Services assume their inputs are already valid.
 *
 * Usage in a route file:
 *   router.post('/rides', [
 *     body('fromCity').notEmpty().trim(),
 *     body('toCity').notEmpty().trim(),
 *     validate,          ← this middleware
 *     rideController.create,
 *   ]);
 */

import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Build field-level details map per AGENT_RULES.md §11.2 error envelope
    const details: Record<string, unknown> = {};
    for (const error of errors.array()) {
      if ('path' in error) {
        details[error.path as string] = error.msg;
      }
    }

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields are invalid.',
        details,
      },
    });
    return;
  }

  next();
}

export default validate;
