-- ============================================================
-- FoodNest — Performance Indexes Migration
-- Execute in Supabase SQL Editor to accelerate production queries
-- ============================================================

-- 1. Accelerate Admin Orders Query filtering by is_cleared_by_admin and sorting by created_at
CREATE INDEX IF NOT EXISTS idx_orders_admin_uncleared
  ON orders (is_cleared_by_admin, created_at DESC);

-- 2. Accelerate Admin Orders filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders (status, created_at DESC)
  WHERE is_cleared_by_admin = FALSE;

-- 3. Accelerate Trending Today calculation and order item lookups
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id
  ON order_items (menu_item_id);

-- 4. Accelerate Menu Items category sorting and availability lookups
CREATE INDEX IF NOT EXISTS idx_menu_items_available_cat
  ON menu_items (is_available, category, item_name);

-- 5. Accelerate Customer Orders listing
CREATE INDEX IF NOT EXISTS idx_orders_customer_recent
  ON orders (customer_id, created_at DESC);
