import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Import routes using require for CommonJS compatibility
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes.default || authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});