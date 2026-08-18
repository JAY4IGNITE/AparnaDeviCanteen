-- Migration: Add order_counters table and get_next_order_number() function

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
