-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) if the app can't create tables.
-- Or use it as reference. The app creates these automatically when it connects successfully.

CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  emoji VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS hall_of_fame (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  difficulty VARCHAR(255) NOT NULL,
  time_seconds INTEGER NOT NULL,
  reveals INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS battles (
  id SERIAL PRIMARY KEY,
  player1 VARCHAR(255) NOT NULL,
  player2 VARCHAR(255) NOT NULL,
  player1_score INTEGER NOT NULL,
  player2_score INTEGER NOT NULL,
  winner VARCHAR(255) NOT NULL,
  difficulty VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default cards (run only once)
INSERT INTO cards (name, emoji) VALUES
  ('Cat', '🐱'),
  ('Dog', '🐶'),
  ('Fox', '🦊'),
  ('Lion', '🦁'),
  ('Panda', '🐼'),
  ('Koala', '🐨');
