const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';
const DEPLOYMENT_ID = '80b7a7ca-ec34-496d-a9a6-e69b42a767cf'; // The latest failed one
const SUCCESS_DEPLOYMENT_ID = '28f2ccee-aabb-47ee-8d1d-f8f9c6a16fae'; // The last successful one

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
