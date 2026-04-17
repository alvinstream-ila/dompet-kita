import { spawn } from "child_process";

const server = spawn("node", ["build/index.js"], { // NOSONAR: Test script execution environment
  cwd: "C:/Programing alvin/Dompet kita/mcp-server",
});

server.stdout.on("data", (data) => {
  console.log("Server Output:", data.toString());
});

server.stderr.on("data", (data) => {
  console.error("Server Error:", data.toString());
});

setTimeout(() => {
  const callRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "get_financial_status",
      arguments: {},
    },
  };
  server.stdin.write(JSON.stringify(callRequest) + "\n");
}, 2000);

setTimeout(() => {
  server.kill();
}, 10000);
