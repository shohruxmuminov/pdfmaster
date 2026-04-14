const https = require('https');

https.get('https://wisdom2.netlify.app/reading/IELTSwithJurabek%20Reading.html', (res) => {
  console.log('Status Code:', res.statusCode);
});
