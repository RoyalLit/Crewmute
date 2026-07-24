import { JwtPayload } from '../../features/auth/auth.types';

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}
