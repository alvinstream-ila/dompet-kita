
const { Client } = require('pg');

const config = {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.lftxmhvmswxhohchnnkn',
  password: 'bL6J9p4sIsAl4fUX',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function test() {
  const client = new Client(config);
  console.log(`Testing New Pooler Host...`);
  try {
    await client.connect();
    console.log(`SUCCESS connected to new pooler host!`);
    const res = await client.query('SELECT current_database(), now()');
    console.log('Result:', res.rows[0]);
    await client.end();
  } catch (e) {
    console.error(`FAILED:`, e.message);
  }
}

test();
