-- Migration: Add is_cleared_by_admin column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_cleared_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
