const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';
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
        value: value,
        skipDeploys: false // Set to false so it triggers a redeploy after setting debug to true
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

upsertVariable('APP_DEBUG', 'true').then(console.log).catch(console.error);
