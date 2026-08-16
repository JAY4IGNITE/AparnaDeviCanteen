const { Client } = require('pg');
require('dotenv').config();

const run = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    const schema = `
      CREATE TABLE IF NOT EXISTS announcements (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        message       TEXT        NOT NULL,
        is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
      CREATE TRIGGER trg_announcements_updated_at
        BEFORE UPDATE ON announcements
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

      ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
    `;

    console.log('📦 Creating announcements table...');
    await client.query(schema);
    console.log('✅ Announcements table created!\n');

    console.log('🎉 Database update complete!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
