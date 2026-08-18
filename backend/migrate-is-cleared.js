const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env');
    console.log('💡 Note: You can also copy and run the SQL query from:');
    console.log('   backend/supabase/add_is_cleared_by_admin.sql');
    console.log('   directly in the Supabase SQL Editor.');
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

    const migrationPath = path.join(__dirname, 'supabase', 'add_is_cleared_by_admin.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Running add_is_cleared_by_admin.sql...');
    await client.query(sql);
    console.log('✅ Column is_cleared_by_admin added successfully!\n');

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
