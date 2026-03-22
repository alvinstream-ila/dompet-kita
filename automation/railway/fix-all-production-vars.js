const https = require('https');

const API_KEY = 'c53d141f-e843-4127-958d-ceb61efdc2c3';
const PROJECT_ID = '6063b6f6-fa15-42c7-aa99-494d7db13ebb';
const ENVIRONMENT_ID = '367db267-2566-4dcb-b8cc-70fb54f33f15';
const SERVICE_ID = '9415fce4-8d0b-4c75-bd92-024e5d78caa0';

async function queryRailway(query, variables = {}) {
  const data = JSON.stringify({ query, variables });
  const options = {
    hostname: 'backboard.railway.app',
    path: '/graphql/v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const updateVariablesQuery = `
mutation variableUpsert($input: VariableUpsertInput!) {
  variableUpsert(input: $input)
}
`;

const newVariables = {
    'APP_DEBUG': 'false',
    'DB_HOST': 'aws-1-ap-southeast-1.pooler.supabase.com',
    'DB_PORT': '6543',
    'DB_DATABASE': 'postgres',
    'DB_USERNAME': 'postgres.lftxmhvmswxhohchnnkn',
    'DB_PASSWORD': 'bL6J9p4sIsAl4fUX',
    'DATABASE_URL': 'postgresql://postgres.lftxmhvmswxhohchnnkn:bL6J9p4sIsAl4fUX@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    'MAIL_MAILER': 'google',
    'MAIL_FROM_ADDRESS': 'official.dompetkita@gmail.com',
    'MAIL_FROM_NAME': 'Dompet Kita',
    'GOOGLE_MAIL_CLIENT_ID': '480550700239-9mejfua6emo04bnp2mktojpbn97jppas.apps.googleusercontent.com',
    'GOOGLE_MAIL_CLIENT_SECRET': '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',
    'GOOGLE_MAIL_REFRESH_TOKEN': '1//04SUSTzN1UACbCgYIARAAGAQSNwF-L9Irl3EYjaOKxGLuO7gxdOZUbE3MaiQHgfYZDzkj2CwG4MVyNO9Mx3cF_6rr70Vo-pBBja8',
    'SANCTUM_STATEFUL_DOMAINS': 'dompet-kita-six.vercel.app,dompet-kita-production.up.railway.app',
    'CORS_ALLOWED_ORIGINS': 'http://localhost:5173,http://127.0.0.1:5173,https://dompet-kita-six.vercel.app'
};

async function updateAll() {
    console.log('--- Starting Production Environment Update with Delays ---');
    for (const [name, value] of Object.entries(newVariables)) {
        process.stdout.write(`Updating ${name}... `);
        const res = await queryRailway(updateVariablesQuery, {
            input: {
                projectId: PROJECT_ID,
                environmentId: ENVIRONMENT_ID,
                serviceId: SERVICE_ID,
                name,
                value
            }
        });
        
        if (res.data && res.data.variableUpsert) {
            console.log('SUCCESS');
        } else {
            console.log('FAILED');
            console.log(JSON.stringify(res, null, 2));
        }
        // Wait 10 seconds to avoid rate limiting
        await new Promise(r => setTimeout(r, 10000));
    }
    console.log('--- Environment Update Complete ---');
}

updateAll().catch(console.error);
