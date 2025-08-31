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

    // Check if user has active GitHub App installations
    let isGitHubAppInstalled = false;
    try {
        // Query installations directly to avoid import issues
      const installationResult = await prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count 
        FROM installations 
        WHERE "userId" = ${user.id} AND status = 'active'
      `;
      
      const count = Number(installationResult[0]?.count || 0);
      isGitHubAppInstalled = count > 0;
      console.log(`User ${user.id} has ${count} active installations`);
    } catch (serviceError) {
      console.warn('Could not check installation status:', serviceError);
      // Default to false if service is unavailable
      isGitHubAppInstalled = false;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isGitHubAppInstalled,
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

// GitHub webhook endpoint for installation events
app.post("/api/v1/webhooks/github", async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.body;

    console.log(`GitHub webhook received: ${event}`, payload);

    // Handle installation events
    if (event === 'installation' || event === 'installation_repositories') {
      const { action, installation, sender } = payload;
      
      if (action === 'created' || action === 'added') {
        // Find the user by GitHub ID
        // Query users table directly with raw SQL
        const githubUsers = await prisma.$queryRaw<Array<{id: number, githubId: string}>>`
          SELECT id, "githubId" FROM users WHERE "githubId" = ${sender.id.toString()}
        `;
        const githubUser = githubUsers[0];

        if (githubUser) {
          // Create installation record directly
          const createdInstallation = await prisma.installation.create({
            data: {
              githubInstallationId: installation.id,
              githubAccountId: installation.account.id,
              githubAccountType: installation.account.type,
              userId: githubUser.id,
              status: 'active'
            }
          });

          // Create repository records
          const repositories = payload.repositories || [];
          for (const repo of repositories) {
            await prisma.repository.create({
              data: {
                githubId: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                isPrivate: repo.private,
                language: repo.language,
                defaultBranch: repo.default_branch || 'main',
                installationId: createdInstallation.id,
                status: 'active'
              }
            });
          }

          console.log(`Installation created for user ${githubUser.id} with ${repositories.length} repositories`);
        } else {
          console.warn('Could not find user for GitHub ID:', sender.id);
        }
      } else if (action === 'deleted') {
        // Handle installation deletion
        await prisma.$executeRaw`
          UPDATE installations 
          SET status = 'deleted', "updatedAt" = NOW()
          WHERE "githubInstallationId" = ${installation.id}
        `;
        console.log(`Installation ${installation.id} marked as deleted`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// GitHub installation callback endpoint - called after user installs GitHub App
app.get("/api/v1/github/installation/callback", authMiddleware, async (req: any, res) => {
  try {
    const { installation_id, setup_action } = req.query;
    
    console.log(`Installation callback received:`, { installation_id, setup_action, userId: req.userId });
    
    if (setup_action === 'install' && installation_id) {
      // Link the installation to the current user
      console.log(`Linking installation ${installation_id} to user ${req.userId}`);
      
      // Update installation with user ID
      const updateResult = await prisma.installation.updateMany({
        where: {
          githubInstallationId: parseInt(installation_id.toString()),
          userId: null
        },
        data: {
          userId: req.userId
        }
      });
      
      console.log(`Installation ${installation_id} linked to user ${req.userId}. Updated ${updateResult.count} records.`);
      
      // If no existing installation was found, create a new one
      if (updateResult.count === 0) {
        console.log(`No existing installation found, creating new record for installation ${installation_id}`);
        await prisma.installation.create({
          data: {
            githubInstallationId: parseInt(installation_id.toString()),
            githubAccountId: 0, // Will be updated by webhook
            githubAccountType: 'User',
            status: 'active',
            userId: req.userId
          }
        });
      }
    }
    
    // Redirect back to dashboard
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    res.redirect(`${baseUrl}/dashboard?installed=true`);
  } catch (error) {
    console.error('Error processing installation callback:', error);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    res.redirect(`${baseUrl}/dashboard?error=installation_failed`);
  }
});

// GitHub App installation URL endpoint  
app.get("/api/v1/github/installations/new", authMiddleware, async (req: any, res) => {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const githubAppId = process.env.GITHUB_APP_ID;
    
    if (!githubAppId) {
      return res.status(500).json({
        success: false,
        message: 'GitHub App ID not configured'
      });
    }
    
    // GitHub App installation URL with callback redirect
    const callbackUrl = `${baseUrl}/api/v1/github/installation/callback`;
    const installationUrl = `https://github.com/apps/mesrai-ai/installations/new?state=${req.userId}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
    
    console.log(`Generated installation URL for user ${req.userId}:`, installationUrl);
    
    res.json({
      success: true,
      data: {
        installationUrl
      }
    });
  } catch (error) {
    console.error('Error generating installation URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate installation URL'
    });
  }
});

// GitHub integration endpoints (dynamic database integration)
app.get("/api/v1/github/repositories", authMiddleware, async (req: any, res) => {
  try {
    // Query repositories directly to avoid import issues
    const repositories = await prisma.$queryRaw<Array<{
      id: number;
      githubId: number;
      name: string;
      fullName: string;
      isPrivate: boolean;
      language: string | null;
      defaultBranch: string;
      status: string;
      lastSyncAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      installationId: number;
    }>>`
      SELECT r.* 
      FROM repositories r
      INNER JOIN installations i ON r."installationId" = i.id
      WHERE i."userId" = ${req.userId} AND i.status = 'active' AND r.status = 'active'
      ORDER BY r."updatedAt" DESC
    `;
    
    // Transform to frontend format
    const formattedRepositories = repositories.map((repo) => ({
      id: repo.id.toString(),
      githubId: repo.githubId,
      name: repo.name,
      fullName: repo.fullName,
      owner: repo.fullName.split('/')[0],
      isPrivate: repo.isPrivate,
      installationId: repo.installationId,
      language: repo.language,
      defaultBranch: repo.defaultBranch,
      isActive: repo.status === 'active',
      lastSyncAt: repo.lastSyncAt?.toISOString(),
      createdAt: repo.createdAt?.toISOString(),
      updatedAt: repo.updatedAt?.toISOString(),
    }));
    
    res.json({
      success: true,
      data: formattedRepositories,
      message: 'Repositories fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repositories'
    });
  }
});

app.get("/api/v1/github/reviews", authMiddleware, async (req: any, res) => {
  try {
    // Query reviews directly to avoid import issues
    const reviews = await prisma.$queryRaw<Array<{
      id: number;
      repositoryId: number;
      pullRequestNumber: number;
      githubPrId: number;
      status: string;
      title: string | null;
      author: string | null;
      createdAt: Date;
      updatedAt: Date;
      completedAt: Date | null;
      repositoryName: string;
      repositoryFullName: string;
    }>>`
      SELECT rs.*, r.name as "repositoryName", r."fullName" as "repositoryFullName"
      FROM review_sessions rs
      INNER JOIN repositories r ON rs."repositoryId" = r.id
      INNER JOIN installations i ON r."installationId" = i.id
      WHERE i."userId" = ${req.userId} AND i.status = 'active'
      ORDER BY rs."createdAt" DESC
      LIMIT 50
    `;
    
    // Transform to frontend format
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      repositoryId: review.repositoryId.toString(),
      pullRequestNumber: review.pullRequestNumber,
      githubPrId: review.githubPrId,
      status: review.status,
      title: review.title,
      createdAt: review.createdAt?.toISOString(),
      updatedAt: review.updatedAt?.toISOString(),
      completedAt: review.completedAt?.toISOString(),
      author: review.author,
      repositoryName: review.repositoryName,
      repositoryFullName: review.repositoryFullName,
    }));

    res.json({
      success: true,
      data: formattedReviews,
      message: 'Reviews fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// GitHub dashboard statistics endpoint
app.get("/api/v1/github/dashboard-stats", authMiddleware, async (req: any, res) => {
  try {
    // Query stats directly to avoid import issues
    const stats = await prisma.$queryRaw<Array<{
      totalRepositories: bigint;
      totalInstallations: bigint;
      activeReviews: bigint;
      completedReviews: bigint;
    }>>`
      SELECT 
        COUNT(DISTINCT r.id) as "totalRepositories",
        COUNT(DISTINCT i.id) as "totalInstallations",
        COUNT(DISTINCT CASE WHEN rs.status IN ('queued', 'analyzing') THEN rs.id END) as "activeReviews",
        COUNT(DISTINCT CASE WHEN rs.status = 'completed' THEN rs.id END) as "completedReviews"
      FROM installations i
      LEFT JOIN repositories r ON r."installationId" = i.id AND r.status = 'active'
      LEFT JOIN review_sessions rs ON rs."repositoryId" = r.id
      WHERE i."userId" = ${req.userId} AND i.status = 'active'
    `;

    const result = stats[0] || {
      totalRepositories: BigInt(0),
      totalInstallations: BigInt(0),
      activeReviews: BigInt(0),
      completedReviews: BigInt(0)
    };

    const formattedStats = {
      totalRepositories: Number(result.totalRepositories),
      totalInstallations: Number(result.totalInstallations),
      activeReviews: Number(result.activeReviews),
      completedReviews: Number(result.completedReviews)
    };

    res.json({
      success: true,
      data: formattedStats,
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

// GitHub App installation redirect endpoint
app.get("/api/v1/github/installations/new", authMiddleware, (req: any, res) => {
  try {
    if (!process.env.GITHUB_APP_ID) {
      return res.status(500).json({
        success: false,
        message: 'GitHub App not configured'
      });
    }

    // Create installation URL with state parameter for security
    const state = Buffer.from(JSON.stringify({ 
      userId: req.userId, 
      timestamp: Date.now() 
    })).toString('base64');
    
    const installationUrl = `https://github.com/apps/${process.env.GITHUB_APP_NAME || 'mesrai-ai-review'}/installations/new?state=${state}`;
    
    res.json({
      success: true,
      data: { installationUrl },
      message: 'Installation URL generated'
    });
  } catch (error) {
    console.error('Error generating GitHub App installation URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate installation URL'
    });
  }
});

// GitHub App installation callback endpoint
app.get("/api/v1/github/installations/callback", async (req: any, res) => {
  try {
    const { installation_id, setup_action, state } = req.query;
    
    if (setup_action !== 'install' && setup_action !== 'update') {
      return res.redirect(`${BASE_URL}?error=installation_cancelled`);
    }

    if (!installation_id) {
      return res.redirect(`${BASE_URL}?error=no_installation_id`);
    }

    // Decode and verify state parameter
    let userId;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = stateData.userId;
      
      // Verify timestamp is recent (within 10 minutes)
      if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
        throw new Error('State expired');
      }
    } catch (error) {
      console.error('Invalid state parameter:', error);
      return res.redirect(`${BASE_URL}?error=invalid_state`);
    }

    // Create installation record immediately upon callback
    try {
      const { RepositoryService } = await import('./services/repository.service');
      const repositoryService = new RepositoryService();
      
      await repositoryService.createInstallation({
        githubInstallationId: parseInt(installation_id),
        githubAccountId: userId, // Using userId as account ID for now
        githubAccountType: 'User',
        userId: userId
      });
      
      console.log(`Installation ${installation_id} created for user ${userId}`);
    } catch (installError) {
      console.error('Error creating installation record:', installError);
    }
    
    res.redirect(`${BASE_URL}?installation_success=true&installation_id=${installation_id}`);
  } catch (error) {
    console.error('Error handling GitHub App installation callback:', error);
    res.redirect(`${BASE_URL}?error=installation_failed`);
  }
});

// Manual installation endpoint for testing/debugging
app.post("/api/v1/github/installations/manual", authMiddleware, async (req: any, res) => {
  try {
    const { githubInstallationId } = req.body;
    
    if (!githubInstallationId) {
      return res.status(400).json({
        success: false,
        message: 'GitHub installation ID is required'
      });
    }

    const { RepositoryService } = await import('./services/repository.service');
    const repositoryService = new RepositoryService();
    
    // Create installation record manually
    const installation = await repositoryService.createInstallation({
      githubInstallationId: parseInt(githubInstallationId),
      githubAccountId: req.userId,
      githubAccountType: 'User',
      userId: req.userId
    });
    
    res.json({
      success: true,
      data: installation,
      message: 'Installation created successfully'
    });
  } catch (error) {
    console.error('Error creating manual installation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create installation'
    });
  }
});

// Check installation status
app.get("/api/v1/github/installations/status", authMiddleware, async (req: any, res) => {
  try {
    const { RepositoryService } = await import('./services/repository.service');
    const repositoryService = new RepositoryService();
    
    const hasInstallations = await repositoryService.hasActiveInstallations(req.userId);
    
    res.json({
      success: true,
      data: { 
        hasInstallations,
        installationCount: hasInstallations ? 1 : 0 // Simplified for now
      },
      message: 'Installation status retrieved'
    });
  } catch (error) {
    console.error('Error checking installation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check installation status'
    });
  }
});

// Start review endpoint
app.post("/api/v1/github/start-review", authMiddleware, async (req: any, res) => {
  try {
    const { repositoryId, pullRequestNumber } = req.body;
    
    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: 'Repository ID is required'
      });
    }

    // For now, create a mock review session
    // In production, this would trigger the actual review workflow
    const reviewSession = {
      id: `review-${Date.now()}`,
      repositoryId,
      pullRequestNumber: pullRequestNumber || 1,
      githubPrId: Math.floor(Math.random() * 10000),
      status: 'queued',
      title: `AI Review for PR #${pullRequestNumber || 1}`,
      author: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };

    res.json({
      success: true,
      data: reviewSession,
      message: 'Review started successfully'
    });
  } catch (error: any) {
    console.error('Error starting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start review'
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
