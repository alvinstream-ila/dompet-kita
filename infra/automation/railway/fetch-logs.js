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

// Correct query for logs: deploymentLogs
const logsQuery = `
query deploymentLogs($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId)
}
`;

const deploymentsQuery = `
query deployments($serviceId: String!) {
  deployments(input: {serviceId: $serviceId}, first: 1) {
    edges {
      node {
        id
        status
      }
    }
  }
}
`;

(async () => {
    try {
        const deployRes = await queryRailway(deploymentsQuery, { serviceId: SERVICE_ID });
        const latestDeploy = deployRes.data.deployments.edges[0].node;
        console.log(`Latest Deployment ID: ${latestDeploy.id} (${latestDeploy.status})`);

        if (latestDeploy.status === "SUCCESS" || latestDeploy.status === "CRASHED" || latestDeploy.status === "BUILDING") {
            const logsRes = await queryRailway(logsQuery, { deploymentId: latestDeploy.id });
            console.log("\n--- LATEST LOGS ---");
            console.log(logsRes.data.deploymentLogs);
        }
    } catch (error) {
        console.error(JSON.stringify(error, null, 2));
    }
})();
