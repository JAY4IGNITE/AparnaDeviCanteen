const http = require('http');

function get(url, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {}
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(rawData) });
        } catch (e) {
          resolve({ status: res.statusCode, rawData });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

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

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(rawData) });
        } catch (e) {
          resolve({ status: res.statusCode, rawData });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

async function verify() {
  try {
    console.log('Logging in as admin to get token...');
    const loginRes = await post('http://localhost:5000/api/auth/login', {
      email: 'admin@aparnacanteen.com',
      password: 'Admin@1508',
      role: 'admin'
    });

    if (loginRes.status !== 200) {
      console.error('Failed to log in as admin:', loginRes);
      return;
    }

    const token = loginRes.data.token;
    console.log('Login successful. Fetching admin orders...');

    const start = Date.now();
    const ordersRes = await get('http://localhost:5000/api/admin/orders', token);
    const duration = Date.now() - start;

    console.log(`GET /api/admin/orders returned status ${ordersRes.status} in ${duration}ms`);
    if (ordersRes.status === 200 && ordersRes.data.success) {
      console.log(`Successfully fetched ${ordersRes.data.data.length} orders!`);
      if (ordersRes.data.data.length > 0) {
        console.log('Sample order data:', ordersRes.data.data[0]);
      }
    } else {
      console.error('Failed to fetch orders:', ordersRes.data);
    }

  } catch (err) {
    console.error('Error during verification:', err);
  }
}

verify();
