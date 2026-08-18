const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const start = Date.now();
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(Date.now() - start);
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Sending 5 login requests consecutively...');
  for (let i = 1; i <= 5; i++) {
    try {
      const duration = await post('http://localhost:5000/api/auth/login', {
        email: 'admin@aparnacanteen.com',
        password: 'Admin@1508',
        role: 'admin'
      });
      console.log(`Request #${i} took: ${duration} ms`);
    } catch (err) {
      console.error(`Request #${i} failed:`, err.message);
    }
  }
}

run();
