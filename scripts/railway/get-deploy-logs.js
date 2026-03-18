const https = require('https');

const API_KEY = 'a9c4a92c-64da-415b-b334-a98b95550826';
const DEPLOYMENT_ID = '8b8c5b76-27f1-440e-88cf-0c3b5d414573'; 

async function getDeployLogs(id) {
  const query = `
  query deploymentLogs($id: String!) {
    deploymentLogs(deploymentId: $id) {
      message
    }
  }
  `;

  const data = JSON.stringify({ 
      query,
      variables: { id }
  });

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

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

getDeployLogs(DEPLOYMENT_ID).then(res => {
    if (res.data && res.data.deploymentLogs) {
        res.data.deploymentLogs.forEach(log => console.log(log.message));
    } else {
        console.log(JSON.stringify(res, null, 2));
    }
}).catch(console.error);
