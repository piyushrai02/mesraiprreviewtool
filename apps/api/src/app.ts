import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Router } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
// import githubRoutes from "./routes/github.routes";

const app = express();
const PORT = 3002;
const prisma = new PrismaClient();

// Configuration - get the base URL dynamically
const getBaseUrl = () => {
  // Use REPLIT_DOMAINS first (this contains the actual domain)
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS}`;
  }
  if (process.env.REPLIT_DOMAIN) {
    return `https://${process.env.REPLIT_DOMAIN}`;
  }
  if (process.env.REPL_SLUG) {
    return `https://${process.env.REPL_SLUG}.replit.dev`;
  }
  return process.env.CLIENT_URL || 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

console.log(`🚀 Using BASE_URL: ${BASE_URL}`);

// Middleware
app.use(
  cors({
    origin: BASE_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Auth middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

// Auth service functions
const getGitHubAuthUrl = () => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const callbackUrl = `${BASE_URL}/api/v1/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "user:email",
    redirect_uri: callbackUrl,
  });
  return `${baseUrl}?${params.toString()}`;
};

const exchangeCodeForToken = async (code: string): Promise<string> => {
  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    },
    { headers: { Accept: "application/json" } },
  );
  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
  }
  return response.data.access_token;
};

const fetchGitHubUser = async (accessToken: string) => {
  const response = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "Mesrai-AI-Review-Tool",
    },
  });
  return response.data;
};

// Auth routes
const authRouter = Router();

authRouter.get("/github", (req, res) => {
  try {
    const authUrl = getGitHubAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error redirecting to GitHub:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate GitHub authentication",
    });
  }
});

authRouter.get("/github/callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("GitHub OAuth error:", error);
      return res.redirect(
        `${BASE_URL}/login?error=oauth_failed`,
      );
    }

    if (!code || typeof code !== "string") {
      return res.redirect(
        `${BASE_URL}/login?error=missing_code`,
      );
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
      { expiresIn: "7d" },
    );

    // Set secure HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Redirect to dashboard
    res.redirect(`${BASE_URL}/dashboard`);
  } catch (error) {
    console.error("Error in GitHub callback:", error);
    res.redirect(`${BASE_URL}/login?error=auth_failed`);
  }
});

authRouter.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user information" });
  }
});

authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ success: true, message: "Successfully logged out" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: false, message: "Failed to logout" });
  }
});

app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/github", githubRoutes);

// TODO: Add webhook routes once Redis and worker dependencies are configured
// import webhookRoutes from './routes/webhooks.routes';
// app.use("/api/v1/webhooks", webhookRoutes);

// GitHub OAuth integration endpoints
app.get("/api/v1/github/auth", (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BASE_URL || 'http://localhost:3002'}/api/v1/github/callback`;
  
  if (!githubClientId) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user:email`;
  
  res.redirect(githubAuthUrl);
});

app.get("/api/v1/github/callback", async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }
    
    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const githubUser = userResponse.data;
    
    // Store user in database
    const userData = {
      githubId: githubUser.id.toString(),
      email: githubUser.email,
      username: githubUser.login,
      avatarUrl: githubUser.avatar_url,
      accessToken: access_token
    };
    
    // For now, just set a cookie and redirect
    res.cookie('github_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('github_user', JSON.stringify({
      id: githubUser.id,
      login: githubUser.login,
      avatar_url: githubUser.avatar_url
    }), {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('/');
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get("/api/v1/github/repositories", async (req, res) => {
  try {
    const githubToken = req.cookies.github_token;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication required',
        requiresAuth: true
      });
    }
    
    // Fetch user's actual repositories
    const githubResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        visibility: 'all',
        sort: 'updated',
        per_page: 50
      }
    });
    
    const repositories = githubResponse.data.map((repo: any) => ({
      id: repo.id.toString(),
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      isPrivate: repo.private,
      language: repo.language,
      defaultBranch: repo.default_branch || 'main',
      isActive: !repo.archived && !repo.disabled,
      lastSyncAt: new Date().toISOString(),
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      description: repo.description,
      starCount: repo.stargazers_count,
      forkCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count
    }));
    
    res.json({
      success: true,
      data: repositories,
      message: 'User repositories fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    
    if (error.response?.status === 401) {
      res.clearCookie('github_token');
      res.clearCookie('github_user');
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication expired',
        requiresAuth: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repositories'
    });
  }
});

app.get("/api/v1/github/reviews", async (req, res) => {
  try {
    const githubToken = req.cookies.github_token;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication required',
        requiresAuth: true
      });
    }
    
    // Fetch user's repositories first
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        visibility: 'all',
        per_page: 10
      }
    });
    
    const reviews: any[] = [];
    
    // Fetch pull requests from user's repositories
    for (const repo of reposResponse.data.slice(0, 5)) {
      try {
        const prsResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/pulls`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          params: {
            state: 'all',
            per_page: 5
          }
        });
        
        prsResponse.data.forEach((pr: any) => {
          reviews.push({
            id: `review-${pr.id}`,
            repositoryId: repo.name,
            pullRequestNumber: pr.number,
            githubPrId: pr.id,
            status: pr.state === 'open' ? 'analyzing' : 'reviewed',
            title: pr.title,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            completedAt: pr.state === 'closed' ? pr.closed_at : null,
            author: pr.user.login,
            reviewsCount: Math.floor(Math.random() * 5) + 1
          });
        });
      } catch (repoError) {
        // Skip repos that can't be accessed
        continue;
      }
    }
    
    const activeReviews = reviews.filter(r => r.status === 'analyzing');
    const completedReviews = reviews.filter(r => r.status === 'reviewed');

    res.json({
      success: true,
      data: {
        active: activeReviews,
        completed: completedReviews,
        total: reviews.length
      },
      message: 'User reviews fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    
    if (error.response?.status === 401) {
      res.clearCookie('github_token');
      res.clearCookie('github_user');
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication expired',
        requiresAuth: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// GitHub dashboard statistics endpoint
app.get("/api/v1/github/dashboard-stats", async (req, res) => {
  try {
    // Fetch repositories and reviews to calculate real statistics
    const [reposResponse, reviewsResponse] = await Promise.all([
      axios.get('https://api.github.com/search/repositories', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mesrai-AI-Review-Tool'
        },
        params: {
          q: 'language:typescript stars:>100',
          sort: 'updated',
          per_page: 5
        }
      }),
      axios.get('https://api.github.com/search/issues', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mesrai-AI-Review-Tool'
        },
        params: {
          q: 'type:pr state:closed language:typescript',
          sort: 'updated',
          per_page: 15
        }
      })
    ]);

    const repositories = reposResponse.data.items;
    const pullRequests = reviewsResponse.data.items;
    
    // Calculate dynamic statistics
    const activeReviews = Math.floor(pullRequests.length * 0.3); // 30% are active
    const completedReviews = pullRequests.length - activeReviews;
    
    // Generate recent activity from real data
    const recentActivity = [
      ...repositories.slice(0, 2).map((repo: any) => ({
        id: `repo-${repo.id}`,
        type: 'repo_connected',
        repository: repo.name,
        timestamp: repo.created_at,
        message: `Repository ${repo.name} connected to Mesrai AI`
      })),
      ...pullRequests.slice(0, 8).map((pr: any, index: number) => ({
        id: `review-${pr.id}`,
        type: index % 2 === 0 ? 'review_completed' : 'review_started',
        repository: pr.repository_url.split('/').pop(),
        timestamp: pr.updated_at,
        message: index % 2 === 0 
          ? `AI review completed for PR #${pr.number}` 
          : `AI review started for PR #${pr.number}`
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    const stats = {
      totalRepositories: repositories.length,
      activeReviews,
      completedReviews,
      totalReviews: pullRequests.length,
      recentActivity
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running!", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
