const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';
const DEPLOYMENT_ID = '01a9a3f8-5a1c-41b4-95fc-5b7f2979cb28'; // The latest failed one
const SUCCESS_DEPLOYMENT_ID = '1e126a7e-a11e-47e3-892e-03bb7c39e159'; // The last successful one

async function getLogs(id) {
  const query = `
  query deploymentLogs($id: String!) {
    deploymentLogs(deploymentId: $id)
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
    console.log(failedLogs.data?.deploymentLogs);
    
    console.log("\n--- SUCCESSFUL DEPLOYMENT LOGS ---");
    const successLogs = await getLogs(SUCCESS_DEPLOYMENT_ID);
    console.log(successLogs.data?.deploymentLogs);
}

run();
