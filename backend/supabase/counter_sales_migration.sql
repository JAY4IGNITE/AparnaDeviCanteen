-- ============================================================
-- FoodNest — Counter Sales Migration
-- ============================================================

CREATE TABLE IF NOT EXISTS counter_orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount  NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counter_order_items (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_order_id UUID        NOT NULL REFERENCES counter_orders(id) ON DELETE CASCADE,
  item_name        TEXT        NOT NULL,
  price            NUMERIC(10,2) NOT NULL,
  quantity         INTEGER     NOT NULL CHECK (quantity >= 1),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counter_order_items_order_id ON counter_order_items (counter_order_id);

-- Disable Row Level Security (consistent with other tables in project)
ALTER TABLE counter_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE counter_order_items DISABLE ROW LEVEL SECURITY;
