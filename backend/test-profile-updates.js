const http = require('http');
const supabase = require('./db');

function request(method, url, data, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = data ? JSON.stringify(data) : '';
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
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
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function run() {
  const phone = '9999999999';
  const initialPassword = 'Password@123';
  const newPassword = 'Password@456';

  try {
    // 0. Cleanup previous test run user if any
    await supabase.from('users').delete().eq('phone', phone);
    await supabase.from('users').delete().eq('phone', '8888888888');

    console.log('1. Registering test customer...');
    const registerRes = await request('POST', 'http://localhost:5000/api/auth/register', {
      name: 'Test Profile User',
      phone: phone,
      password: initialPassword,
      confirmPassword: initialPassword,
      hostelBlock: 'F Block'
    });
    console.log('Register response:', registerRes);

    console.log('\n2. Logging in with original password...');
    const loginRes = await request('POST', 'http://localhost:5000/api/auth/login', {
      phone: phone,
      password: initialPassword,
      role: 'customer'
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    console.log('\n3. Updating profile details (name, phone, block)...');
    const updateRes = await request('PUT', 'http://localhost:5000/api/auth/profile', {
      name: 'Updated Test User',
      phone: '8888888888',
      hostelBlock: 'Other'
    }, token);
    
    console.log('Update profile response:', updateRes);
    if (updateRes.status !== 200 || updateRes.data.user.name !== 'Updated Test User') {
      throw new Error('Profile update validation failed');
    }

    console.log('\n4. Changing password...');
    const passwordRes = await request('PUT', 'http://localhost:5000/api/auth/password', {
      currentPassword: initialPassword,
      newPassword: newPassword,
      confirmPassword: newPassword
    }, token);

    console.log('Change password response:', passwordRes);
    if (passwordRes.status !== 200) {
      throw new Error('Password change validation failed');
    }

    console.log('\n5. Logging out and logging back in with NEW password...');
    const loginNewRes = await request('POST', 'http://localhost:5000/api/auth/login', {
      phone: '8888888888',
      password: newPassword,
      role: 'customer'
    });

    console.log('Login with new password response:', loginNewRes);
    if (loginNewRes.status !== 200) {
      throw new Error('Failed to log in with new password');
    }
    console.log('Success! Logged in using new password.');

    console.log('\n6. Cleaning up test user...');
    await supabase.from('users').delete().eq('phone', '8888888888');
    console.log('Cleanup complete. All tests passed successfully!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
    // Cleanup on error
    await supabase.from('users').delete().eq('phone', phone);
    await supabase.from('users').delete().eq('phone', '8888888888');
  }
}

run();
