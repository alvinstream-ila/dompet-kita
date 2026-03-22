const https = require('https');

const API_KEY = 'c53d141f-e843-4127-958d-ceb61efdc2c3';
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

const listDeploymentsQuery = `
query deployments($serviceId: String!) {
  deployments(input: { serviceId: $serviceId }, first: 10) {
    edges {
      node {
        id
        status
        createdAt
      }
    }
  }
}
`;

queryRailway(listDeploymentsQuery, { serviceId: SERVICE_ID }).then(res => {
    if (res.data && res.data.deployments) {
        res.data.deployments.edges.forEach(edge => {
            console.log(`${edge.node.createdAt} - ${edge.node.id}: ${edge.node.status}`);
        });
    } else {
        console.log(JSON.stringify(res, null, 2));
    }
}).catch(console.error);
