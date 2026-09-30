-- Run this in Supabase: SQL Editor -> New query -> paste -> Run
-- Safe to run again: it only adds what is missing.
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS age         INTEGER CHECK (age BETWEEN 1 AND 120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS class       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- The same roll number cannot be used twice in one class
CREATE UNIQUE INDEX IF NOT EXISTS users_class_roll_number_key ON users (class, roll_number);
