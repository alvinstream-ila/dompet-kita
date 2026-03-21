const https = require('https');

const API_KEY = 'a961da69-2c01-4944-835b-24d134890347';
const DEPLOYMENT_ID = 'bad8bbe3-6dec-48d3-9d83-cdb975c3b51d'; // The debug one that failed
const SUCCESS_DEPLOYMENT_ID = '86ee9c7d-59b8-493f-86b9-1a74c9c8e345'; // The latest working one

async function getLogs(id) {
  const query = `
  query deploymentLogs($id: String!) {
    deploymentLogs(deploymentId: $id) {
      message
      timestamp
    }
  }
  `;

  const data = JSON.stringify({ 
      query,
      variables: { id }
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

async function run() {
    console.log("--- FAILED DEPLOYMENT LOGS ---");
    const failedLogs = await getLogs(DEPLOYMENT_ID);
    console.log(JSON.stringify(failedLogs, null, 2));
    
    console.log("\n--- SUCCESSFUL DEPLOYMENT LOGS ---");
    const successLogs = await getLogs(SUCCESS_DEPLOYMENT_ID);
    console.log(JSON.stringify(successLogs, null, 2));
}

run();
