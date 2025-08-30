import { Router } from 'express';
import axios from 'axios';

const router = Router();

// GitHub dashboard statistics endpoint
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user has GitHub token
    const user = await (req as any).prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true }
    });

    if (!user?.githubAccessToken) {
      return res.json({
        success: true,
        data: {
          totalRepositories: 0,
          activeReviews: 0,
          completedReviews: 0,
          totalReviews: 0,
          recentActivity: []
        },
        message: 'No GitHub account connected'
      });
    }

    // Fetch repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mesrai-AI-Review-Tool'
      },
      params: {
        per_page: 100,
        type: 'owner'
      }
    });

    const repositories = reposResponse.data;
    const totalRepositories = repositories.length;

    // Fetch pull requests statistics
    let totalPullRequests = 0;
    let activePullRequests = 0;
    let completedPullRequests = 0;
    const recentActivity = [];

    for (const repo of repositories.slice(0, 20)) { // Limit for performance
      try {
        const pullsResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/pulls`, {
          headers: {
            'Authorization': `token ${user.githubAccessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Mesrai-AI-Review-Tool'
          },
          params: {
            state: 'all',
            per_page: 20,
            sort: 'updated'
          }
        });

        const pulls = pullsResponse.data;
        totalPullRequests += pulls.length;

        for (const pr of pulls) {
          if (pr.state === 'open') {
            activePullRequests++;
          } else {
            completedPullRequests++;
          }

          // Add to recent activity
          if (recentActivity.length < 10) {
            const activityType = pr.state === 'open' ? 'review_started' : 'review_completed';
            recentActivity.push({
              id: `pr-${pr.id}`,
              type: activityType,
              repository: repo.name,
              timestamp: pr.updated_at,
              message: `${activityType === 'review_started' ? 'Review started' : 'Review completed'} for PR #${pr.number}: ${pr.title.substring(0, 50)}${pr.title.length > 50 ? '...' : ''}`
            });
          }
        }
      } catch (repoError) {
        console.log(`Skipping repository ${repo.full_name}:`, repoError.message);
        continue;
      }
    }

    // Add repository connection activities
    for (const repo of repositories.slice(0, 5)) {
      if (recentActivity.length < 15) {
        recentActivity.push({
          id: `repo-${repo.id}`,
          type: 'repo_connected',
          repository: repo.name,
          timestamp: repo.created_at,
          message: `Repository ${repo.name} connected`
        });
      }
    }

    // Sort activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const stats = {
      totalRepositories,
      activeReviews: activePullRequests,
      completedReviews: completedPullRequests,
      totalReviews: totalPullRequests,
      recentActivity: recentActivity.slice(0, 10)
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error.response?.status === 401) {
      return res.json({
        success: true,
        data: {
          totalRepositories: 0,
          activeReviews: 0,
          completedReviews: 0,
          totalReviews: 0,
          recentActivity: []
        },
        message: 'GitHub token expired or invalid'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

export default router;