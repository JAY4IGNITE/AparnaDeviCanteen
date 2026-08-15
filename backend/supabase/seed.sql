-- ============================================================
-- FoodNest — Seed Admin User
-- Run this in the Supabase SQL Editor AFTER running schema.sql
--
-- Password is: admin123  (bcrypt hash below)
-- Change the password after first login!
-- ============================================================

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@foodnest.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt of 'admin123'
  'admin'
)
ON CONFLICT (email) DO NOTHING;
