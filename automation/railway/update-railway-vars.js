const https = require('node:https');

const API_KEY = process.env.RAILWAY_TOKEN;
const PROJECT_ID = '6063b6f6-fa15-42c7-aa99-494d7db13ebb';
const ENVIRONMENT_ID = '367db267-2566-4dcb-b8cc-70fb54f33f15';
const SERVICE_ID = '9415fce4-8d0b-4c75-bd92-024e5d78caa0';

async function queryRailway(query, variables = {}) {
  const data = JSON.stringify({ 
      query,
      variables
  });

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

  return new Promise((resolve, reject) => {
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

const updateVariablesQuery = `
mutation variableUpsert($input: VariableUpsertInput!) {
  variableUpsert(input: $input)
}
`;

const newVariables = {
    'APP_URL': 'https://dompet-kita-production.up.railway.app',
    'GOOGLE_REDIRECT_URL': 'https://dompet-kita-production.up.railway.app/api/auth/google/callback',
    'FACEBOOK_REDIRECT_URL': 'https://dompet-kita-production.up.railway.app/api/auth/facebook/callback',
    'SESSION_DRIVER': 'database',
};

async function updateAll() {
    for (const [name, value] of Object.entries(newVariables)) {
        console.log(`Updating ${name}...`);
        const res = await queryRailway(updateVariablesQuery, {
            input: {
                projectId: PROJECT_ID,
                environmentId: ENVIRONMENT_ID,
                serviceId: SERVICE_ID,
                name,
                value
            }
        });
        console.log(JSON.stringify(res, null, 2));
    }
}

updateAll().then(() => console.log('Finished updating variables.')).catch(console.error);
