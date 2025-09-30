# LanceSports Backend API Server

This is the backend API server for the LanceSports application, implementing the authentication flow you described.

## 🔐 Authentication Flow

```
User logs in with Google → gets a JWT from Supabase.
Frontend sends requests with Authorization: Bearer <token>.
Middleware runs before the route:
  - Looks at the token
  - Verifies it with Supabase
  - If valid → attaches user info (Google ID) to req.user
  - Your route can now use req.user.id safely
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📁 Project Structure

```
server/
├── index.ts              # Main server file with routes
├── authMiddleware.ts     # Authentication middleware
├── tsconfig.json         # TypeScript configuration
├── package.json          # Server dependencies
├── env.example           # Environment variables template
└── README.md            # This file
```

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (if needed for server-side)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 🛡️ Authentication Middleware

### `authenticateToken`
- **Required**: Yes
- **Purpose**: Protects routes that require authentication
- **Usage**: `app.get('/protected', authenticateToken, (req, res) => {})`
- **Result**: `req.user` contains authenticated user info

### `optionalAuth`
- **Required**: No
- **Purpose**: Adds user info if available, doesn't block requests
- **Usage**: `app.get('/public', optionalAuth, (req, res) => {})`
- **Result**: `req.user` may or may not exist

## 📡 API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check

### Protected Endpoints (Auth Required)
- `GET /api/user/profile` - Get user profile
- `GET /api/user/matches` - Get user's matches
- `POST /api/matches` - Create a new match

### Optional Auth Endpoints
- `GET /api/public/sports` - Get sports data (personalized if authenticated)

## 💻 Frontend Integration

The frontend uses the `api.ts` utility file to make authenticated requests:

```typescript
import { api } from '../lib/api';

// Get user profile (automatically includes auth token)
const profile = await api.getUserProfile();

// Create a match (automatically includes auth token)
const newMatch = await api.createMatch({
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  sport: 'Football'
});
```

## 🔑 How It Works

1. **User signs in** via Google OAuth in the frontend
2. **Supabase creates a JWT** and stores it in the user's session
3. **Frontend makes API calls** with the JWT in the Authorization header
4. **Middleware verifies the JWT** with Supabase
5. **User info is attached** to `req.user` for use in routes
6. **Routes can safely access** user data without additional verification

## 🧪 Testing the Authentication

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Test protected endpoint (should fail):**
   ```bash
   curl http://localhost:3001/api/user/profile
   # Returns: {"error":"Access token required"}
   ```

4. **Test with valid token:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/user/profile
   ```

## 🚨 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configured for your frontend domain
- **JWT Verification**: All tokens verified with Supabase
- **Service Role Key**: Server uses Supabase service role for admin operations
- **Input Validation**: Request body validation on protected routes

## 🔄 Development Workflow

1. **Make changes** to TypeScript files
2. **Server auto-restarts** with nodemon (if using `npm run dev:watch`)
3. **Test endpoints** with your frontend or tools like Postman
4. **Build for production** with `npm run build`

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env` file exists and has correct values
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key)

2. **"Token verification failed"**
   - Check if the JWT is expired
   - Verify the token format: `Bearer <token>`
   - Ensure Supabase is accessible

3. **CORS errors**
   - Check `FRONTEND_URL` in your `.env`
   - Ensure your frontend is running on the expected port

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 Next Steps

1. **Add more protected routes** as needed
2. **Implement rate limiting** for production
3. **Add request validation** with libraries like Joi or Zod
4. **Set up logging** to a service like Winston
5. **Add monitoring** and health checks
6. **Implement caching** for frequently accessed data

## 🤝 Contributing

When adding new routes:
1. Use appropriate middleware (`authenticateToken` or `optionalAuth`)
2. Access user data via `req.user` (if authenticated)
3. Add proper error handling
4. Update this README with new endpoints
