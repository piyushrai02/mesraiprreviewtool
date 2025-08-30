/**
 * Authentication Service
 * @fileoverview Handles GitHub OAuth flow, user management, and JWT operations
 */

import jwt from 'jsonwebtoken';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { ClientUser, GitHubUser } from '@shared/types';

const prisma = new PrismaClient();

export class AuthService {
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;
  private readonly jwtSecret: string;

  constructor() {
    this.githubClientId = process.env.GITHUB_CLIENT_ID!;
    this.githubClientSecret = process.env.GITHUB_CLIENT_SECRET!;
    this.jwtSecret = process.env.JWT_SECRET!;

    if (!this.githubClientId || !this.githubClientSecret || !this.jwtSecret) {
      throw new Error('Missing required environment variables for authentication');
    }
  }

  /**
   * Generate GitHub OAuth authorization URL
   */
  getGitHubAuthUrl(): string {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const params = new URLSearchParams({
      client_id: this.githubClientId,
      scope: 'user:email',
      redirect_uri: `${process.env.CLIENT_URL}/api/v1/auth/github/callback`,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange GitHub code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.githubClientId,
          client_secret: this.githubClientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange code for access token');
    }
  }

  /**
   * Fetch user profile from GitHub API
   */
  async fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Mesrai-AI-Review-Tool',
        },
      });

      return response.data as GitHubUser;
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      throw new Error('Failed to fetch user profile from GitHub');
    }
  }

  /**
   * Create or update user in database
   */
  async upsertUser(githubUser: GitHubUser): Promise<ClientUser> {
    try {
      const user = await prisma.user.upsert({
        where: { githubId: githubUser.id.toString() },
        update: {
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
          updatedAt: new Date(),
        },
        create: {
          githubId: githubUser.id.toString(),
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
        },
      });

      // Return client-safe user object
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      console.error('Error upserting user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Generate JWT token for user
   */
  generateToken(userId: number): string {
    try {
      return jwt.sign(
        { userId, iat: Math.floor(Date.now() / 1000) },
        this.jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (error) {
      console.error('Error generating JWT:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Verify JWT token and return user ID
   */
  verifyToken(token: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<ClientUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Handle complete GitHub OAuth flow
   */
  async handleGitHubCallback(code: string): Promise<{ user: ClientUser; token: string }> {
    try {
      // Exchange code for access token
      const accessToken = await this.exchangeCodeForToken(code);

      // Fetch user profile from GitHub
      const githubUser = await this.fetchGitHubUser(accessToken);

      // Create or update user in database
      const user = await this.upsertUser(githubUser);

      // Generate JWT token
      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error('Error in GitHub callback:', error);
      throw error;
    }
  }
}