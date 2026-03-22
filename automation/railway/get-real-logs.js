const https = require('https');

const API_KEY = 'c53d141f-e843-4127-958d-ceb61efdc2c3';
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

async function getLatestDeploymentId() {
  const query = `
    query deployments($serviceId: String!) {
      deployments(input: {serviceId: $serviceId}, first: 1) {
        edges {
          node {
            id
            status
          }
        }
      }
    }
  `;
  const res = await queryRailway(query, { serviceId: SERVICE_ID });
  return res.data.deployments.edges[0].node.id;
}

async function getLogs(id) {
  const query = `
    query deploymentLogs($id: String!) {
      deploymentLogs(deploymentId: $id) {
        message
        timestamp
      }
    }
  `;
  const res = await queryRailway(query, { id });
  return res.data.deploymentLogs;
}

async function run() {
  const id = await getLatestDeploymentId();
  console.log(`Fetching logs for deployment ${id}...`);
  const logs = await getLogs(id);
  logs.forEach(l => {
      if (l.message.includes('DEBUG_AI') || l.message.includes('ERROR')) {
          console.log(`[${l.timestamp}] ${l.message}`);
      }
  });
}

run().catch(console.error);
