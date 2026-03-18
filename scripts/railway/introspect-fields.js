const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';

const query = `
query {
  __type(name: "Query") {
    fields {
      name
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
  res.on('end', () => console.log(body));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
