-- ============================================================
-- FoodNest — Supabase Schema
-- Run this in the Supabase SQL Editor (once)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  phone         TEXT        UNIQUE,
  email         TEXT        UNIQUE,
  password      TEXT        NOT NULL,
  hostel_block  TEXT,
  is_blocked    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name     TEXT        NOT NULL,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_available  BOOLEAN     NOT NULL DEFAULT TRUE,
  category      TEXT        NOT NULL DEFAULT 'General',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount  NUMERIC(10,2) NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
  is_cleared_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id  ON orders (customer_id, created_at DESC);

-- ============================================================
-- ORDER ITEMS (normalized from embedded array)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID        REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name     TEXT        NOT NULL,
  quantity      INTEGER     NOT NULL CHECK (quantity >= 1),
  price         NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message       TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at via trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Disable Row Level Security (auth is handled by Express/JWT)
-- ============================================================
ALTER TABLE users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders      DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- ORDER COUNTERS (for custom sequential order IDs)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_counters (
  id            TEXT        PRIMARY KEY,
  last_value    INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE order_counters DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  -- Ensure the counter row exists
  INSERT INTO order_counters (id, last_value)
  SELECT 'order_number', COALESCE(MAX(order_number), 0) FROM orders
  ON CONFLICT (id) DO NOTHING;

  -- Increment and return the new value
  UPDATE order_counters
  SET last_value = last_value + 1
  WHERE id = 'order_number'
  RETURNING last_value INTO next_val;

  RETURN next_val;
END;
$$ LANGUAGE plpgsql;
