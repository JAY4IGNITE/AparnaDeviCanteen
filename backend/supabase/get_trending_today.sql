-- ============================================================
-- Function: get_trending_today()
-- Returns top ranked dishes based on portions ordered TODAY (Asia/Kolkata)
-- Only counts valid orders: 'Pending', 'Preparing', 'Completed'
-- Excludes cancelled orders ('Cancelled')
-- ============================================================

CREATE OR REPLACE FUNCTION get_trending_today(limit_count INT DEFAULT 6)
RETURNS TABLE (
  id UUID,
  item_name TEXT,
  category TEXT,
  price NUMERIC,
  image_url TEXT,
  is_veg BOOLEAN,
  is_available BOOLEAN,
  orders_today BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_start_utc TIMESTAMPTZ;
  today_end_utc TIMESTAMPTZ;
BEGIN
  -- Calculate start and end of current Indian calendar day in UTC
  today_start_utc := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE::TIMESTAMPTZ AT TIME ZONE 'Asia/Kolkata';
  today_end_utc   := today_start_utc + INTERVAL '1 day' - INTERVAL '1 millisecond';

  RETURN QUERY
  WITH order_aggregates AS (
    SELECT
      oi.menu_item_id,
      SUM(oi.quantity)::BIGINT AS total_ordered
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= today_start_utc
      AND o.created_at <= today_end_utc
      AND o.status IN ('Pending', 'Preparing', 'Completed')
      AND oi.menu_item_id IS NOT NULL
    GROUP BY oi.menu_item_id
  )
  SELECT
    m.id,
    m.item_name,
    m.category,
    m.price,
    m.image_url,
    m.is_veg,
    m.is_available,
    oa.total_ordered AS orders_today,
    ROW_NUMBER() OVER (ORDER BY oa.total_ordered DESC) AS rank
  FROM order_aggregates oa
  INNER JOIN menu_items m ON oa.menu_item_id = m.id
  ORDER BY oa.total_ordered DESC
  LIMIT limit_count;
END;
$$;
