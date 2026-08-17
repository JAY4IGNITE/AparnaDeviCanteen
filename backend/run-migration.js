const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env');
    console.log('💡 Note: You can also copy and run the SQL query from:');
    console.log('   backend/supabase/add_order_number.sql');
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

    // Run add_order_number.sql
    const sqlPath = path.join(__dirname, 'supabase', 'add_order_number.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📦 Running add_order_number.sql migration...');
    await client.query(sql);
    console.log('✅ Migration successfully executed!\n');

  } catch (err) {
    console.error('❌ Error executing migration:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
