/**
 * Authentication Controller
 * @fileoverview Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

/**
 * Redirect user to GitHub OAuth authorization
 */
export const redirectToGitHub = (req: Request, res: Response): void => {
  try {
    const authUrl = authService.getGitHubAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to GitHub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate GitHub authentication',
    });
  }
};

/**
 * Handle GitHub OAuth callback
 */
export const handleGitHubCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, error } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('GitHub OAuth error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${process.env.CLIENT_URL}/login?error=missing_code`);
      return;
    }

    // Complete OAuth flow
    const { user, token } = await authService.handleGitHubCallback(code);

    // Set secure HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

/**
 * Get current authenticated user
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await authService.getUserById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information',
    });
  }
};

/**
 * Logout user by clearing authentication cookie
 */
export const logout = (req: Request, res: Response): void => {
  try {
    // Clear authentication cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};