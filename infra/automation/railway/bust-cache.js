const https = require("node:https");

const API_KEY = process.env.RAILWAY_TOKEN;
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

const upsertVarsMutation = `
mutation variableUpsert($input: VariableUpsertInput!) {
  variableUpsert(input: $input)
}
`;

(async () => {
    try {
        const res = await queryRailway(upsertVarsMutation, {
            input: {
                serviceId: SERVICE_ID,
                environmentId: ENVIRONMENT_ID,
                name: "CACHE_BUSTER_V2026",
                value: "v_final_" + Date.now(),
            },
        });
        if (res.errors) {
            console.error("Railway API Errors:", JSON.stringify(res.errors, null, 2));
        } else {
            console.log("Railway Cache Bust Status: SUCCESS");
        }
    } catch (error) {
        console.error("Railway Request Failed:", error.message);
    }
})();
