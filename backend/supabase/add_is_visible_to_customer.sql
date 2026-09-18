-- Migration: Add is_visible_to_customer column to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_visible_to_customer BOOLEAN NOT NULL DEFAULT TRUE;
