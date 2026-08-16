const http = require('http');

function post(url, data, token) {
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
    req.write(body);
    req.end();
  });
}

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

async function test() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await post('http://localhost:5000/api/auth/login', {
      email: 'admin@foodnest.com',
      password: 'Admin@1508',
      role: 'admin'
    });
    
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes);
      return;
    }
    
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    console.log('\nFetching admin announcements...');
    const getRes = await get('http://localhost:5000/api/admin/announcements', token);
    console.log('GET response status:', getRes.status);
    console.log('GET response data:', getRes.data);

    console.log('\nCreating an announcement...');
    const postRes = await post('http://localhost:5000/api/admin/announcements', {
      message: 'Test Announcement',
      is_active: true
    }, token);
    console.log('POST response status:', postRes.status);
    console.log('POST response data:', postRes.data);

  } catch (err) {
    console.error('Error:', err);
  }
}

test();
