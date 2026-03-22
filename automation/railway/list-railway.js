const https = require('node:https');

const API_KEY = process.env.RAILWAY_TOKEN;

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

const listProjectsQuery = `
query projects {
  projects {
    edges {
      node {
        id
        name
        environments {
          edges {
            node {
              id
              name
            }
          }
        }
        services {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
`;

queryRailway(listProjectsQuery).then(res => {
    console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
