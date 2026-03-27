const https = require('node:https');

// Fixed tokens from .env file
const API_KEY = '7f28a9fc-6dec-42b3-a5ed-28ea652a5d8f';
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
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse JSON: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const query = `
query deployments($serviceId: String!) {
  deployments(input: {serviceId: $serviceId}, first: 5) {
    edges {
      node {
        id
        status
        createdAt
        meta
      }
    }
  }
}
`;

(async () => {
  try {
    const res = await queryRailway(query, { serviceId: SERVICE_ID });
    if (res.errors) {
      console.error('GraphQL Errors:', JSON.stringify(res.errors, null, 2));
      process.exit(1);
    }
    const deployments = res.data.deployments.edges;
    console.log('\n--- DOMPET KITA RAILWAY STATUS ---');
    if (deployments.length === 0) {
      console.log('No deployments found.');
    } else {
      deployments.forEach(({ node: d }) => {
        console.log(`ID: ${d.id}`);
        console.log(`Status: ${d.status}`);
        console.log(`Created At: ${d.createdAt}`);
        // Safely access meta fields
        const commit = d.meta ? d.meta.githubCommitMessage || 'N/A' : 'N/A';
        console.log(`Commit: ${commit}`);
        console.log('---------------------------');
      });
    }
  } catch (error) {
    console.error('Execution Error:', error.message);
    process.exit(1);
  }
})();
