import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authenticateToken, optionalAuth } from './authMiddleware';
import compression from 'compression';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(compression()); // Compress responses
app.use(helmet()); // Security headers
// TEMP: allow all origins in development to avoid CORS blocks
app.use(cors());
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

// Public proxy route to avoid browser CORS when calling external fixtures API
app.get('/api/fixtures', async (req, res) => {
  try {
    console.log("fetching tata in server/index.ts");
    const q = req.query as any;
    const dateParam = q['date'] as string | undefined;
    const limitParam = q['limit'] as string | undefined;
    const compact = q['compact'] === '1' || q['compact'] === 'true';
    const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 0)) : undefined;

    const date = dateParam || new Date().toISOString().slice(0, 10);
    const targetUrl = `https://lancesports-fixtures-api.onrender.com/fixtures?date=${encodeURIComponent(date)}&limit=20`;
    const response = await fetch(targetUrl);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
    const payload = await response.json();

    let fixtures = Array.isArray(payload?.fixtures) ? payload.fixtures : [];

    if (typeof limit === 'number') {
      fixtures = fixtures.slice(0, limit);
    }

    if (compact) {
      fixtures = fixtures.map((f: any) => ({
        fixture: {
          id: f?.fixture?.id,
          date: f?.fixture?.date,
          status: { long: f?.fixture?.status?.long, short: f?.fixture?.status?.short }
        },
        league: { name: f?.league?.name },
        teams: {
          home: { name: f?.teams?.home?.name, logo: f?.teams?.home?.logo },
          away: { name: f?.teams?.away?.name, logo: f?.teams?.away?.logo }
        },
        goals: { home: f?.goals?.home ?? null, away: f?.goals?.away ?? null }
      }));
    }

    return res.json({ fixtures });
  } catch (err: any) {
    console.error('Fixtures proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
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
