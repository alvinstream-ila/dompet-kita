
const { Client } = require('pg');

const configDirect = {
  host: 'db.lftxmhvmswxhohchnnkn.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'bL6J9p4sIsAl4fUX',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

const configPooler = {
  ...configDirect,
  port: 6543
};

async function test(name, config) {
  const client = new Client(config);
  console.log(`Testing ${name}...`);
  try {
    await client.connect();
    console.log(`${name} SUCCESS`);
    const res = await client.query('SELECT current_database(), now()');
    console.log('Result:', res.rows[0]);
    await client.end();
  } catch (e) {
    console.error(`${name} FAILED:`, e.message);
  }
}

async function run() {
  await test('DIRECT (5432)', configDirect);
  await test('POOLER (6543)', configPooler);
}

run();
