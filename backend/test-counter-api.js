const http = require('http');
require('dotenv').config();

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
      email: 'admin@aparnacanteen.com',
      password: 'Admin@1508',
      role: 'admin'
    });
    
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes);
      return;
    }
    
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    console.log('\nSending a Counter Sale POST request...');
    const postRes = await post('http://localhost:5000/api/admin/counter-sales', {
      items: [
        { name: 'Veg Fried Rice', price: 100, quantity: 2 },
        { name: 'Dum Biryani', price: 150, quantity: 1 }
      ]
    }, token);

    console.log('POST Response status:', postRes.status);
    console.log('POST Response data:', postRes.data);

    console.log('\nFetching Counter Sales Statistics...');
    const getRes = await get('http://localhost:5000/api/admin/counter-sales/stats', token);
    console.log('GET Response status:', getRes.status);
    console.log('GET Response data total items in stats:', getRes.data?.data?.items?.length);
    console.log('GET Response grand total revenue:', getRes.data?.data?.grandTotalRevenue);

  } catch (err) {
    console.error('Error during testing:', err);
  }
}

// Start the Express server first and then test
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const server = app.listen(5000, async () => {
  console.log('Test Express server started on port 5000');
  await test();
  server.close(() => {
    console.log('Test Express server stopped');
  });
});
