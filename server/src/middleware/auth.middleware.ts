import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: TokenPayload & { id: number };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyAccessToken(token);
    
    // Verify user still exists and is not locked
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.locked) {
      return res.status(401).json({ error: 'User not found or locked' });
    }

    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user is admin or committee member
export const isCommittee = (req: AuthRequest, res: Response, next: NextFunction) => {
  const committeeRoles = ['Admin', 'LopTruong', 'LopPhoHocTap', 'LopPhoDoiSong', 'BiThu', 'PhoBiThu', 'UyVien'];
  return authorize(...committeeRoles)(req, res, next);
};

// Check if user is admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  return authorize('Admin')(req, res, next);
};
