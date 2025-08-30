/**
 * Authentication Middleware
 * @fileoverview JWT verification middleware for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const authService = new AuthService();

/**
 * Middleware to verify JWT token and attach user ID to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookies
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
      return;
    }

    // Verify token
    const { userId } = authService.verifyToken(token);

    // Attach user ID to request
    req.userId = userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token present
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.auth_token;

    if (token) {
      const { userId } = authService.verifyToken(token);
      req.userId = userId;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};