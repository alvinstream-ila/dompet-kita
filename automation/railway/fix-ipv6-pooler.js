const https = require('https');

const API_KEY = 'a961da69-2c01-4944-835b-24d134890347';
const PROJECT_ID = '6063b6f6-fa15-42c7-aa99-494d7db13ebb';
const SERVICE_ID = '9415fce4-8d0b-4c75-bd92-024e5d78caa0';
const ENVIRONMENT_ID = '367db267-2566-4dcb-b8cc-70fb54f33f15';

async function upsertVariable(name, value) {
  const query = `
  mutation variableUpsert($input: VariableUpsertInput!) {
    variableUpsert(input: $input)
  }
  `;

  const data = JSON.stringify({
    query,
    variables: {
      input: {
        projectId: PROJECT_ID,
        environmentId: ENVIRONMENT_ID,
        serviceId: SERVICE_ID,
        name: name,
        value: value
      }
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

(async () => {
    const dbConfig = {
        DB_HOST: 'aws-0-ap-southeast-1.pooler.supabase.com',
        DB_USERNAME: 'postgres.lftxmhvmswxhohchnnkn',
        DB_PASSWORD: 'bL6J9p4sIsAl4fUX',
        DB_DATABASE: 'postgres',
        DB_PORT: '6543', // Supavisor Transaction Port (IPv4 Compatible)
        // Some apps expect a full DATABASE_URL
        DATABASE_URL: 'postgres://postgres.lftxmhvmswxhohchnnkn:bL6J9p4sIsAl4fUX@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
    };

    for (const [name, value] of Object.entries(dbConfig)) {
        console.log(`Setting ${name}...`);
        console.log(await upsertVariable(name, value));
    }
})();
