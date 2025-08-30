/**
 * Authentication Routes
 * @fileoverview Express routes for GitHub OAuth authentication
 */

import { Router } from 'express';
import {
  redirectToGitHub,
  handleGitHubCallback,
  getMe,
  logout,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GitHub OAuth flow
router.get('/github', redirectToGitHub);
router.get('/github/callback', handleGitHubCallback);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

export default router;