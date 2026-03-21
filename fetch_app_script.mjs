import https from 'https';

const data = JSON.stringify({
  action: 'read',
  tabName: 'Tests',
  sheetId: '1EekahV5IPYorWoian7ccV90f3mL10cXbdXPoteoJl_c'
});

const options = {
  hostname: 'script.google.com',
  port: 443,
  path: '/macros/s/AKfycbxn3uIu_aVf1C3B8f1ws7kC4HaBsFeNt8naahsn2FpSt1aYSO2SeNIa4Or10AW6V7hMjA/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // Follow redirect
    https.get(res.headers.location, (redirectRes) => {
      let body = '';
      redirectRes.on('data', (chunk) => body += chunk);
      redirectRes.on('end', () => console.log(body));
    });
  } else {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => console.log(body));
  }
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
