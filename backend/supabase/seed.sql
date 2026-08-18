-- ============================================================
-- FoodNest — Seed Admin User
-- Run this in the Supabase SQL Editor AFTER running schema.sql
--
-- Password is: Admin@1508  (bcrypt hash below)
-- Change the password after first login!
-- ============================================================

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@aparnacanteen.com',
  '$2a$10$wENhaDdwQkz50K4rc9yKXO5okCTNcbnOZvLNyU8xb9LFjUeC0VWWe', -- bcrypt of 'Admin@1508'
  'admin'
)
ON CONFLICT (email) DO NOTHING;
