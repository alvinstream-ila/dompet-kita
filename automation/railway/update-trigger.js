const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';
const TRIGGER_ID = 'dc85529a-be1f-4260-9265-a490e9d328ec';

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

const updateTriggerMutation = `
mutation deploymentTriggerUpdate($id: String!, $input: DeploymentTriggerUpdateInput!) {
  deploymentTriggerUpdate(id: $id, input: $input) {
    id
    branch
  }
}
`;

queryRailway(updateTriggerMutation, { 
    id: TRIGGER_ID, 
    input: { branch: "main" } 
}).then(res => {
    console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
