import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  role: 'ADMIN' | 'CUSTOMER';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (jwtSecret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = auth.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, jwtSecret) as AuthUser;
      req.user = { id: payload.id, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

export const requireRole = (role: AuthUser['role']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
};
