const token =
  'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.Nr2AsrVNcV9naN2Mt_YG87BrtG684O8151ONPgBvE7Ytl99h6k5oOA.mQWgCfzffaxcj2od.4JNqlRa1ynF9OA0zfnKpdSPEeg0wi9umF384SIE0hmfTB4_dnjoq-RyHpiJY2ZukzBSwH9PFXHymnW5_dHcbttLYDAv_0-aHRvGsTjofxmIpgnyUL0JG0vySDTlIChJuxOrrevtrVJ3KLdlEzaOR2WuW1zlbVNI_Iij_MjEhQPR8B56NybttjZS7kK-9U1H6A9g2pvCCn47E.k30zB0nt_Ocjoirl2cywvg';
const baseUrl = 'https://design.penpot.app/api/rpc/command';

async function testEndpoint(command) {
  console.log(`Testing command: ${command}`);
  try {
    const res = await fetch(`${baseUrl}/${command}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    console.log(`Response for ${command}:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error for ${command}:`, err.message);
  }
}

async function run() {
  await testEndpoint('get-profile');
  await testEndpoint('list-projects');
  await testEndpoint('list-teams');
  await testEndpoint('get-workspaces');
}

run();
