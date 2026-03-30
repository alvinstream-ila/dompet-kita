import { spawn } from "child_process";

const server = spawn("node", ["build/index.js"], {
  cwd: "C:/Programing alvin/Dompet kita/mcp-server",
});

server.stdout.on("data", (data) => {
  console.log(`STDOUT: [${data.toString()}]`);
});

server.stderr.on("data", (data) => {
  console.error(`STDERR: [${data.toString()}]`);
});

const initializeRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0",
    },
  },
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(initializeRequest) + "\n");
}, 1000);

setTimeout(() => {
  server.kill();
}, 3000);
