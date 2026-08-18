const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env');
    console.error('   Find it in: Supabase → Project Settings → Database → Connection string (URI)');
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

    // Run schema.sql
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📦 Running schema.sql...');
    await client.query(schema);
    console.log('✅ Tables created!\n');

    // Run seed.sql
    const seedPath = path.join(__dirname, 'supabase', 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Running seed.sql (admin user)...');
    await client.query(seed);
    console.log('✅ Admin user seeded!\n');

    console.log('🎉 Database setup complete!');
    console.log('   Admin email:    admin@aparnacanteen.com');
    console.log('   Admin password: Admin@1508');
    console.log('   ⚠️  Change the password after first login!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
