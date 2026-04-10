// Test with valid token generation
const jwt = require('jsonwebtoken');
const http = require('http');

// Generate a valid test token (same as your auth controller)
const testToken = jwt.sign(
  { 
    id: 'test-admin-id', 
    role: 'admin' 
  },
  'YeMeraSecretKeyHai123!@#',
  { expiresIn: '1h' }
);

console.log('🔑 Generated test token:', testToken);

function testRequest(method, path, data = null, headers = {}) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    const postData = JSON.stringify(data);
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        console.log('Response:', body);
        resolve({ status: res.statusCode, data: body });
      });
    });

    req.on('error', (err) => {
      console.error(`${method} ${path} - Error:`, err.message);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testValidToken() {
  console.log('🧪 Testing with VALID admin token...\n');

  // Test with valid token (should work)
  console.log('Testing POST /api/category/add (valid token):');
  try {
    await testRequest('POST', '/api/category/add', {
      name: 'Test Category from Valid Token',
      description: 'This should work with valid token'
    }, {
      'Authorization': `Bearer ${testToken}`
    });
  } catch (err) {
    console.log('❌ Unexpected failure:', err.message);
  }
}

testValidToken();
