const https = require('node:https');

const API_KEY = process.env.RAILWAY_TOKEN;
const SERVICE_ID = '9415fce4-8d0b-4c75-bd92-024e5d78caa0';

const query = `
query deployments($serviceId: String!) {
  deployments(input: { serviceId: $serviceId }) {
    edges {
      node {
        id
        status
        staticUrl
      }
    }
  }
}
`;

const data = JSON.stringify({ 
    query,
    variables: { serviceId: SERVICE_ID }
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

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log(body));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
