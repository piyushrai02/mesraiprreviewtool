import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3002;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

// Auth service functions
const getGitHubAuthUrl = () => {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: 'user:email',
    redirect_uri: `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`,
  });
  return `${baseUrl}?${params.toString()}`;
};

const exchangeCodeForToken = async (code: string): Promise<string> => {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    },
    { headers: { Accept: 'application/json' } }
  );
  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
  }
  return response.data.access_token;
};

const fetchGitHubUser = async (accessToken: string) => {
  const response = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Mesrai-AI-Review-Tool',
    },
  });
  return response.data;
};

// Auth routes
const authRouter = Router();

authRouter.get('/github', (req, res) => {
  try {
    const authUrl = getGitHubAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to GitHub:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate GitHub authentication' });
  }
});

authRouter.get('/github/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('GitHub OAuth error:', error);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/login?error=oauth_failed`);
    }
    
    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/login?error=missing_code`);
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);
    
    // Fetch user profile from GitHub
    const githubUser = await fetchGitHubUser(accessToken);
    
    // Create or update user in database
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to dashboard
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard`);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}/login?error=auth_failed`);
  }
});

authRouter.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user information' });
  }
});

authRouter.post('/logout', (req, res) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({ success: true, message: 'Successfully logged out' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ success: false, message: 'Failed to logout' });
  }
});

app.use('/api/v1/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});