const https = require("node:https");

const API_KEY = process.env.RAILWAY_TOKEN;
const SERVICE_ID = "9415fce4-8d0b-4c75-bd92-024e5d78caa0";

async function queryRailway(query, variables = {}) {
  const data = JSON.stringify({ query, variables });
  const options = {
    hostname: "backboard.railway.app",
    path: "/graphql/v2",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "Content-Length": Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve(JSON.parse(body)));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const deploymentsQuery = `
query deployments($serviceId: String!) {
  deployments(input: {serviceId: $serviceId}, first: 10) {
    edges {
      node {
        id
        status
        meta
      }
    }
  }
}
`;

(async () => {
    try {
        const res = await queryRailway(deploymentsQuery, { serviceId: SERVICE_ID });
        console.log(JSON.stringify(res, null, 2));
    } catch (error) {
        console.error(error);
    }
})();
