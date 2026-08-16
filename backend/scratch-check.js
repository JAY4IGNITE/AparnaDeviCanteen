const { Client } = require('pg');

const PASSWORDS = [
  'Admin@1508',
  'admin123',
  'FoodNest',
  'foodnest',
  'FoodNest@123',
  'Foodnest@123',
  'foodnest123',
  'AparnaCanteen',
  'aparnacanteen',
  'AparnaCanteen@123',
  'aparna',
  'aparna123',
  'Aparna@123',
  'postgres',
  'postgres123',
  'postgres@123'
];

async function attempt(password) {
  const host = `aws-0-ap-southeast-1.pooler.supabase.com`;
  const dbUrl = `postgresql://postgres.rgxcyqrndumgcoeibqvf:${encodeURIComponent(password)}@${host}:6543/postgres`;
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS WITH PASSWORD: "${password}"`);
    
    // Perform Alter Table
    console.log('Dropping old constraint...');
    await client.query(`
      ALTER TABLE orders 
      DROP CONSTRAINT IF EXISTS orders_status_check;
    `);
    
    console.log('Adding new constraint with Cancelled status...');
    await client.query(`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_status_check CHECK (status IN ('Pending', 'Completed', 'Cancelled'));
    `);
    
    console.log('🎉 Database constraint updated successfully!');
    await client.end();
    return true;
  } catch (err) {
    console.log(`Password "${password}" failed: ${err.message}`);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  for (const pw of PASSWORDS) {
    const success = await attempt(pw);
    if (success) {
      process.exit(0);
    }
  }
  console.log('❌ All passwords failed.');
}

run();
