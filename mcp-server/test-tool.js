
import { spawn } from 'child_process';

const server = spawn('node', ['build/index.js'], {
  cwd: 'C:/Programing alvin/Dompet kita/mcp-server'
});

server.stdout.on('data', (data) => {
  console.log('Server Output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

const listRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(listRequest) + '\n');
}, 1000);

setTimeout(() => {
  const callRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'penpot_list_projects',
      arguments: {}
    }
  };
  server.stdin.write(JSON.stringify(callRequest) + '\n');
}, 3000);

setTimeout(() => {
  server.kill();
}, 10000);
