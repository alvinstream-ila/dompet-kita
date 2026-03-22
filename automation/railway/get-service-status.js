const https = require('https');

const API_KEY = process.env.RAILWAY_TOKEN;
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

const serviceQuery = `
query service($id: String!) {
  service(id: $id) {
    id
    name
    instances {
      edges {
        node {
          id
          environmentId
          latestDeployment {
            id
            status
            createdAt
          }
        }
      }
    }
  }
}
`;

queryRailway(serviceQuery, { id: SERVICE_ID }).then(res => {
    console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
