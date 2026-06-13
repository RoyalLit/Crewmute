import { Request, Response, NextFunction } from 'express';
import * as jsonwebtoken from 'jsonwebtoken';
import { UnauthorizedError } from '../shared/errors';
import env from '../config/env';
import { JwtPayload } from '../features/auth/auth.types';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing or invalid.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jsonwebtoken.verify(token, env.accessTokenSecret) as JwtPayload;
    
    // Attach the decoded user payload to the request object
    req.user = decoded;
    
    next();
  } catch (error) {
    throw new UnauthorizedError('Token is invalid or expired.');
  }
};
