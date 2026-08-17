const { Client } = require('pg');
require('dotenv').config();

async function checkIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        schemaname = 'public'
      ORDER BY
        tablename,
        indexname;
    `);
    console.log('--- Database Indexes ---');
    res.rows.forEach(row => {
      console.log(`Table: ${row.tablename} | Index: ${row.indexname}`);
      console.log(`Def: ${row.indexdef}\n`);
    });
  } catch (err) {
    console.error('Error checking indexes:', err);
  } finally {
    await client.end();
  }
}

checkIndexes();
