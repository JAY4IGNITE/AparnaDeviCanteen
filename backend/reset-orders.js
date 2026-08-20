const { Client } = require('pg');
const supabase = require('./db');
require('dotenv').config();

const resetWithPG = async (dbUrl) => {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected via Postgres URL.');

    console.log('⏳ Clearing orders and resetting counters in a transaction...');
    await client.query('BEGIN;');

    // 1. Truncate orders (cascades to order_items)
    await client.query('TRUNCATE TABLE orders CASCADE;');
    console.log('   - Cleared orders and order_items tables.');

    // 2. Delete the order counter
    await client.query("DELETE FROM order_counters WHERE id = 'order_number';");
    console.log('   - Reset order_number row in order_counters.');

    // 3. Reset the postgres serial sequence
    await client.query('ALTER SEQUENCE IF EXISTS orders_order_number_seq RESTART WITH 1;');
    console.log('   - Reset orders_order_number_seq sequence to 1.');

    await client.query('COMMIT;');
    console.log('🎉 Reset completed successfully via PostgreSQL Direct Client!');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('❌ Error during PostgreSQL reset:', err.message);
    throw err;
  } finally {
    await client.end();
  }
};

const resetWithSupabase = async () => {
  console.log('🔌 Connecting via Supabase client (REST/RPC)...');

  // 1. Delete all records from orders table (will cascade delete order_items)
  console.log('⏳ Deleting orders table records...');
  const { error: deleteOrdersError } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteOrdersError) {
    console.error('❌ Error deleting orders:', deleteOrdersError.message);
    throw deleteOrdersError;
  }
  console.log('   - Cleared all orders.');

  // 2. Delete the order counter row to reset it
  console.log('⏳ Deleting order_counters row for order_number...');
  const { error: deleteCounterError } = await supabase
    .from('order_counters')
    .delete()
    .eq('id', 'order_number');

  if (deleteCounterError) {
    console.error('❌ Error resetting order counter:', deleteCounterError.message);
    throw deleteCounterError;
  }
  console.log('   - Reset order_number row in order_counters.');

  console.log('🎉 Reset completed successfully via Supabase REST Client!');
};

const main = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      await resetWithPG(dbUrl);
      process.exit(0);
    } catch (err) {
      console.log('⚠️ PostgreSQL direct reset failed. Trying fallback to Supabase client...');
    }
  }

  try {
    await resetWithSupabase();
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed entirely:', err.message);
    process.exit(1);
  }
};

main();
