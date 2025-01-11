import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  role: string;
}

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as CustomJwtPayload;
    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAuthenticatedUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as CustomJwtPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
