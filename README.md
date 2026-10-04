# 🎤 Glitter Mic - Multiplayer Karaoke App

A modern, real-time karaoke web application with voice scoring, animated lyrics, and multiplayer support.

![Navy Blue Theme](https://img.shields.io/badge/Theme-Navy%20Blue-001f3f)
![Blood Pink Accent](https://img.shields.io/badge/Accent-Blood%20Pink-FF1744)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## ✨ Features

- 🎵 **Music Library** - Browse thousands of songs via Jamendo API
- 🎙️ **Real-time Voice Scoring** - Powered by Deepgram speech-to-text
- ✨ **Animated Lyrics** - Spotify-style word-by-word reveal with glow effects
- 👥 **Multiplayer Modes** - Solo, Duet, and Collab rooms (up to 8 players)
- 🏆 **Leaderboards** - Compete for high scores
- 🔐 **Secure Authentication** - Email/password with Redis sessions
- 📱 **Responsive Design** - Works beautifully on mobile and desktop

## 🎨 Design

- **Color Scheme**: Navy blue background (#001f3f), blood pink accents (#FF1744), blood red highlights (#B71C1C)
- **No Glassmorphism**: Clean, solid color cards with subtle animations
- **Inspired by Stardust**: Beautiful loading animations and smooth transitions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)
- API keys for:
  - Deepgram (speech-to-text)
  - Jamendo (music library)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Karoake
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   The `.env` files are already configured with credentials. Update them if needed:
   
   - `apps/api/.env` - Backend configuration
   - `apps/web/.env` - Frontend configuration

4. **Run database migrations**
   ```bash
   npm run migrate -w @glitter-mic/api
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 📦 Project Structure

```
glitter-mic/
├── apps/
│   ├── api/              # Express + Socket.IO backend
│   │   ├── src/
│   │   │   ├── routes/   # Auth, Songs, Deepgram
│   │   │   ├── lib/      # Database, Redis, Logger
│   │   │   ├── models/   # User, Session types
│   │   │   └── middleware/
│   │   └── .env
│   ├── web/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/    # Auth, Game, DesignSystem
│   │   │   ├── components/
│   │   │   └── styles/
│   │   └── .env
│   └── worker/           # Python worker (audio processing)
└── packages/
    └── scoring-core/     # Shared scoring logic
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/session` - Check auth status

### Songs (Jamendo)
- `GET /api/songs` - Search and browse songs
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/meta/genres` - Get music genres

### Speech-to-Text (Deepgram)
- `GET /api/deepgram/token` - Get temporary token
- `POST /api/deepgram/transcribe` - Transcribe audio

## 🗄️ Database Schema

### Users
- id (UUID)
- email (unique)
- username (unique)
- password_hash
- display_name
- avatar_url
- created_at, updated_at, last_login

### Game Sessions
- id (UUID)
- user_id (FK)
- song_id, song_title, artist_name
- mode (solo/duet/collab)
- score, accuracy, pitch_score, timing_score, lyrics_score
- completed, started_at, completed_at

### User Stats
- user_id (PK)
- total_games, total_score, highest_score
- average_accuracy, favorite_song_id
- rank_points, level

## 🎮 Game Flow

1. **Authentication** - User signs up or logs in
2. **Song Selection** - Browse and select from Jamendo catalog
3. **Microphone Check** - Verify audio input
4. **Gameplay** - Sing along with animated lyrics
5. **Real-time Scoring** - Deepgram transcribes, server scores
6. **Results** - View score breakdown and leaderboard

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (dev server & build)
- Framer Motion (animations)
- Tailwind CSS
- Zustand (state management)

### Backend
- Node.js + Express
- Socket.IO (real-time)
- PostgreSQL (Neon)
- Redis (Upstash)
- bcryptjs (password hashing)

### APIs & Services
- **Deepgram** - Speech-to-text API
- **Jamendo** - Royalty-free music library
- **Neon** - Serverless PostgreSQL
- **Upstash** - Serverless Redis

## 📱 Responsive Design

The app is fully responsive with optimized layouts for:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

Key features:
- Touch-friendly buttons and inputs
- Adaptive text sizing
- Mobile-first navigation
- Optimized animations for performance

## 🚀 Deployment

### Backend (Render/Railway)

1. Set environment variables from `apps/api/.env`
2. Build command: `npm run build -w @glitter-mic/api`
3. Start command: `npm run start -w @glitter-mic/api`
4. Run migrations: `npm run migrate -w @glitter-mic/api`

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build -w @glitter-mic/web`
3. Output directory: `apps/web/dist`

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- HTTP-only session cookies
- CORS configured for specific origins
- Rate limiting on all API routes
- Input validation with Zod
- SQL injection protection with parameterized queries

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- Music powered by [Jamendo](https://www.jamendo.com)
- Speech-to-text by [Deepgram](https://deepgram.com)
- Inspired by [Stardust](https://www.stardust.com) design

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ and 🎤 by the Glitter Mic team
