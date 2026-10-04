-- Glitter Mic Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_code VARCHAR(10) UNIQUE,
  song_id VARCHAR(255) NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('solo', 'duet', 'collab')),
  score INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 2) DEFAULT 0,
  pitch_score INTEGER DEFAULT 0,
  timing_score INTEGER DEFAULT 0,
  lyrics_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for game sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_code ON game_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_games INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  average_accuracy DECIMAL(5, 2) DEFAULT 0,
  total_songs_completed INTEGER DEFAULT 0,
  favorite_song_id VARCHAR(255),
  rank_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.avatar_url,
  us.total_score,
  us.highest_score,
  us.total_games,
  us.average_accuracy,
  us.rank_points,
  us.level,
  ROW_NUMBER() OVER (ORDER BY us.rank_points DESC, us.highest_score DESC) as rank
FROM users u
INNER JOIN user_stats us ON u.id = us.user_id
WHERE u.is_active = true
ORDER BY us.rank_points DESC, us.highest_score DESC
LIMIT 100;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to user_stats
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
