const https = require('https');
const API_KEY = process.env.RAILWAY_TOKEN;

const query = `
query mutationDetails($name: String!) {
  __type(name: "Mutation") {
    fields {
      name
      args {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
}
`;

async function main() {
    const data = JSON.stringify({ query, variables: { name: "Mutation" } });
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
            const result = JSON.parse(body);
            const mutation = result.data.__type.fields.find(f => f.name === process.argv[2]);
            console.log(JSON.stringify(mutation, null, 2));
        });
    });
    req.write(data);
    req.end();
}
main().catch(console.error);
