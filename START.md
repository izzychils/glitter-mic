# 🚀 Quick Start Guide

## First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migration
```bash
npm run migrate -w @glitter-mic/api
```

This will create all necessary tables in your Neon PostgreSQL database:
- ✅ Users table
- ✅ Game sessions table
- ✅ User stats table
- ✅ Leaderboard view

### 3. Start Development Servers
```bash
npm run dev
```

This starts both:
- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:4000

## What You'll See

1. **Auth Page** (first visit)
   - Beautiful animated background with floating particles
   - Sign up or login forms
   - Smooth transitions between forms

2. **Game Page** (after login)
   - Welcome message with your username
   - Quick action cards (Solo, Collab, Duet, Daily Challenge)
   - Song search and selection
   - User stats display

## Testing the App

### Create an Account
1. Go to http://localhost:5173
2. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Display Name: `Test Singer` (optional)
3. Click "Create Account"
4. You'll be redirected to the game page

### Test Session Persistence
1. Refresh the page → You should stay logged in
2. Close and reopen browser → Still logged in
3. Click logout → Redirected to auth page

### Test Login
1. Click "Already have an account? Sign in"
2. Enter your email and password
3. Click "Sign In"
4. Redirected to game page

## Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Start only frontend
npm run dev:api          # Start only backend

# Building
npm run build            # Build all packages
npm run typecheck        # Check TypeScript types

# Database
npm run migrate -w @glitter-mic/api    # Run database migrations
```

## Environment Variables

All credentials are already set in:
- `apps/api/.env` - Backend config
- `apps/web/.env` - Frontend config

### Configured Services:
- ✅ **Neon PostgreSQL** - Database
- ✅ **Upstash Redis** - Session storage
- ✅ **Deepgram** - Speech-to-text
- ✅ **Jamendo** - Music library

## Troubleshooting

### Port Already in Use
If you see "Port 4000 is already in use":
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in apps/api/.env
PORT=4001
```

### Database Connection Error
- Verify Neon database is active
- Check `DATABASE_URL` in `apps/api/.env`
- Try running migration again

### Redis Connection Error
- Check `REDIS_URL` and `REDIS_TOKEN` in `apps/api/.env`
- Verify Upstash Redis is active

### CORS Error
- Ensure backend is running on port 4000
- Check `VITE_API_URL` in `apps/web/.env`
- Verify `CLIENT_ORIGIN` in `apps/api/.env`

## What's Working

✅ **Authentication**
- Email/password signup and login
- Secure session management with Redis
- Password hashing with bcryptjs
- Protected routes

✅ **UI/UX**
- Navy blue + blood pink color scheme
- Smooth animations with Framer Motion
- Responsive design (mobile, tablet, desktop)
- Loading spinners inspired by Stardust
- No glassmorphism - clean solid colors

✅ **Backend**
- Express API with TypeScript
- PostgreSQL database with Neon
- Redis sessions with Upstash
- Input validation with Zod
- Rate limiting

✅ **API Integrations**
- Jamendo music library routes
- Deepgram speech-to-text endpoints
- Ready for real-time game functionality

## Next Steps

To add real karaoke functionality:

1. **Implement Song Player**
   - Use Jamendo audio URLs
   - Add audio controls
   - Sync with lyrics display

2. **Add Microphone Input**
   - Request microphone permission
   - Stream audio to Deepgram
   - Display real-time transcription

3. **Integrate Animated Lyrics**
   - Parse LRC format lyrics
   - Use `AnimatedLyrics` component
   - Highlight words as user sings

4. **Real-time Scoring**
   - Compare user's words with lyrics
   - Calculate pitch, timing, accuracy
   - Update score in real-time

5. **Socket.IO for Multiplayer**
   - Room creation and joining
   - Sync game state across players
   - Real-time reactions and scores

## Support

- 📖 See `README.md` for full documentation
- 🚀 See `DEPLOYMENT.md` for production deployment
- 💬 Open an issue on GitHub for questions

---

**Enjoy building Glitter Mic! 🎤✨**
