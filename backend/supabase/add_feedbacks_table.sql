-- Migration: Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opinion       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable Row Level Security (consistent with other tables in project)
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
