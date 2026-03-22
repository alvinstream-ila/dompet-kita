const https = require('https');

const API_KEY = 'c53d141f-e843-4127-958d-ceb61efdc2c3';

const query = `
query {
  __type(name: "Service") {
    fields {
      name
      type { name kind }
    }
  }
}
`;

const data = JSON.stringify({ query });

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
  res.on('end', () => {
    const parsed = JSON.parse(body);
    console.log(JSON.stringify(parsed, null, 2));
  });
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
