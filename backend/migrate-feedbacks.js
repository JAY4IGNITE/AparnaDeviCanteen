const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env');
    console.log('💡 Note: Since DATABASE_URL is not set, you can run this SQL query directly in your Supabase SQL Editor:');
    console.log('\n--- SQL START ---');
    console.log(fs.readFileSync(path.join(__dirname, 'supabase', 'add_feedbacks_table.sql'), 'utf8'));
    console.log('--- SQL END ---\n');
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

    const migrationPath = path.join(__dirname, 'supabase', 'add_feedbacks_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Running add_feedbacks_table.sql...');
    await client.query(sql);
    console.log('✅ Feedbacks table created and Row Level Security disabled!\n');

    console.log('🎉 Migration complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
