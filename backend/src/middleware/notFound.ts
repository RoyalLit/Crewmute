/**
 * 404 Not Found handler.
 *
 * Registered after all routes. Fires when no route matched the request.
 * Per AGENT_RULES.md §11.2 — uses the standard error envelope.
 */

import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

function notFound(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
}

export default notFound;
