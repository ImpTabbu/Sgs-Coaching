import https from 'https';

https.get('https://docs.google.com/spreadsheets/d/1EekahV5IPYorWoian7ccV90f3mL10cXbdXPoteoJl_c/gviz/tq?tqx=out:json&sheet=Tests', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.log('Error: ', err.message));
