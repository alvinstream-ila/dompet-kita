const https = require('https');

const API_KEY = 'a961da69-2c01-4944-835b-24d134890347';
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

const getVariablesQuery = `
query variables($projectId: String!, $environmentId: String!, $serviceId: String) {
  variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
}
`;

queryRailway(getVariablesQuery, { projectId: PROJECT_ID, environmentId: ENVIRONMENT_ID, serviceId: SERVICE_ID }).then(res => {
    console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
