import { Router } from 'express';
import { GitHubController } from '../controllers/github.controller.js';

const router = Router();
const githubController = new GitHubController();

// GitHub App installation routes
router.get('/installation', githubController.handleInstallation);

// Webhook endpoint
router.post('/webhook', githubController.handleWebhook);

// Repository management routes
router.get('/repositories', githubController.getRepositories);
router.get('/repositories/:id', githubController.getRepository);

// Review management routes
router.get('/reviews', githubController.getReviews);
router.post('/review/start', githubController.startReview);
router.get('/review/:id/status', githubController.getReviewStatus);

// Manual review trigger (for testing/admin)
router.post('/review/manual', githubController.triggerManualReview);

// Utility routes
router.post('/validate-permissions', githubController.validatePermissions);

export default router;