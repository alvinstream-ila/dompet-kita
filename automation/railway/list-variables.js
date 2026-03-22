const https = require('https');

const API_KEY = 'c53d141f-e843-4127-958d-ceb61efdc2c3';
const PROJECT_ID = '6063b6f6-fa15-42c7-aa99-494d7db13ebb';
const SERVICE_ID = '9415fce4-8d0b-4c75-bd92-024e5d78caa0';
const ENVIRONMENT_ID = '367db267-2566-4dcb-b8cc-70fb54f33f15';

async function getVariables() {
  const query = `
  query variables($projectId: String!, $environmentId: String!, $serviceId: String!) {
    variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
  }
  `;

  const data = JSON.stringify({
    query,
    variables: {
      projectId: PROJECT_ID,
      environmentId: ENVIRONMENT_ID,
      serviceId: SERVICE_ID
    }
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

getVariables().then(console.log).catch(console.error);
