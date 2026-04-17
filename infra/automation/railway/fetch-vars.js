const https = require("node:https");

const API_KEY = process.env.RAILWAY_TOKEN;
const PROJECT_ID = "336940fb-c003-49d7-84bc-2f1d8c973a0e";
const SERVICE_ID = "9415fce4-8d0b-4c75-bd92-024e5d78caa0";
const ENVIRONMENT_ID = "367db267-2566-4dcb-b8cc-70fb54f33f15";

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

const varsQuery = `
query variables($projectId: String!, $environmentId: String!, $serviceId: String!) {
  variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
}
`;

(async () => {
    try {
        console.log("Checking production environment variables...");
        const res = await queryRailway(varsQuery, { 
            projectId: PROJECT_ID,
            environmentId: ENVIRONMENT_ID,
            serviceId: SERVICE_ID
        });
        if (res.data && res.data.variables) {
            const vars = res.data.variables;
            console.log("Variables found: " + Object.keys(vars).join(", "));
            console.log("APP_KEY exists: " + (!!vars.APP_KEY));
            console.log("DB_CONNECTION: " + vars.DB_CONNECTION);
            console.log("APP_ENV: " + vars.APP_ENV);
            console.log("APP_DEBUG: " + vars.APP_DEBUG);
        } else {
            console.log(JSON.stringify(res, null, 2));
        }
    } catch (error) {
        console.error(error);
    }
})();
