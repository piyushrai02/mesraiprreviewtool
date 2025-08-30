import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ViteExpress from './vite.js';
import { setupRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../client/dist')));

// Setup API routes
setupRoutes(app);

// Start server with Vite integration
ViteExpress.listen(app, PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});