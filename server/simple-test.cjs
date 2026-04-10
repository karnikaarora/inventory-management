// Simple test without external dependencies
const http = require('http');

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

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  // Test 1: Public endpoint (should work)
  console.log('1. Testing GET /api/category/all (public):');
  try {
    await testRequest('GET', '/api/category/all');
  } catch (err) {
    console.log('❌ Failed:', err.message);
  }

  console.log('\n');

  // Test 2: Protected endpoint without token (should fail)
  console.log('2. Testing POST /api/category/add (no token):');
  try {
    await testRequest('POST', '/api/category/add', {
      name: 'Test Category',
      description: 'Test Description'
    });
  } catch (err) {
    console.log('✅ Expected failure:', err.message);
  }

  console.log('\n');

  // Test 3: Protected endpoint with fake token (should fail)
  console.log('3. Testing POST /api/category/add (fake token):');
  try {
    await testRequest('POST', '/api/category/add', {
      name: 'Test Category',
      description: 'Test Description'
    }, {
      'Authorization': 'Bearer fake-token'
    });
  } catch (err) {
    console.log('✅ Expected failure:', err.message);
  }
}

runTests();
