import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authenticateToken, optionalAuth } from './authMiddleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your Vite dev server
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'LanceSports API is running'
  });
});

// Protected route example - requires authentication
app.get('/api/user/profile', authenticateToken, (req, res) => {
  // req.user is guaranteed to exist here due to authenticateToken middleware
  res.json({
    message: 'Profile retrieved successfully',
    user: {
      id: req.user!.id,
      google_id: req.user!.google_id,
      email: req.user!.email,
      username: req.user!.username
    }
  });
});

// Protected route for user's matches
app.get('/api/user/matches', authenticateToken, (req, res) => {
  // This route requires authentication
  res.json({
    message: `Matches for user ${req.user!.username}`,
    userId: req.user!.id,
    googleId: req.user!.google_id,
    // In a real app, you'd fetch matches from database here
    matches: []
  });
});

// Optional auth route - works with or without authentication
app.get('/api/public/sports', optionalAuth, (req, res) => {
  const response: any = {
    message: 'Public sports data',
    sports: ['Football', 'Basketball', 'Tennis', 'Cricket']
  };

  // If user is authenticated, add personalized info
  if (req.user) {
    response.user = {
      username: req.user.username,
      message: `Welcome back, ${req.user.username}!`
    };
  }

  res.json(response);
});

// Protected route for creating matches
app.post('/api/matches', authenticateToken, (req, res) => {
  const { homeTeam, awayTeam, sport, date } = req.body;
  
  if (!homeTeam || !awayTeam || !sport) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'homeTeam, awayTeam, and sport are required'
    });
  }

  // In a real app, you'd save this to your database
  const newMatch = {
    id: Date.now().toString(),
    homeTeam,
    awayTeam,
    sport,
    date: date || new Date().toISOString(),
    createdBy: req.user!.id,
    createdByGoogleId: req.user!.google_id,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Match created successfully',
    match: newMatch
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LanceSports API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Protected routes require Authorization: Bearer <token>`);
});

export default app;
