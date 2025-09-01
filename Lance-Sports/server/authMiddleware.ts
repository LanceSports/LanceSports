import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        google_id: string;
        email: string;
        username: string;
      };
    }
  }
}

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for server');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid JWT token in the Authorization header'
      });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('google_id, username, email')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ 
        error: 'User data fetch failed',
        message: 'Unable to retrieve user information'
      });
    }

    // Attach user info to the request object
    req.user = {
      id: user.id,
      google_id: userData.google_id,
      email: userData.email || user.email || '',
      username: userData.username || user.user_metadata?.full_name || 'Unknown User'
    };

    console.log(`✅ User authenticated: ${req.user.username} (${req.user.google_id})`);
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Optional: Middleware to check if user is authenticated (doesn't block the request)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        const { data: userData } = await supabase
          .from('users')
          .select('google_id, username, email')
          .eq('id', user.id)
          .single();

        req.user = {
          id: user.id,
          google_id: userData?.google_id || '',
          email: userData?.email || user.email || '',
          username: userData?.username || user.user_metadata?.full_name || 'Unknown User'
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't block the request, just continue without user info
    console.log('Optional auth failed, continuing without user info');
    next();
  }
};
