// Test script to check authentication flow
import axios from 'axios';

async function testAuth() {
  console.log('Testing authentication flow...');
  
  // First test without token (should fail)
  try {
    const response1 = await axios.post('http://localhost:5000/api/category/add', {
      name: 'Test Category',
      description: 'Test Description'
    });
    console.log('❌ No token response:', response1.status, response1.data);
  } catch (error) {
    console.log('✅ No token error (expected):', error.response?.status, error.response?.data);
  }

  // Test with fake token (should fail)
  try {
    const response2 = await axios.post('http://localhost:5000/api/category/add', {
      name: 'Test Category',
      description: 'Test Description'
    }, {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    console.log('❌ Fake token response:', response2.status, response2.data);
  } catch (error) {
    console.log('✅ Fake token error (expected):', error.response?.status, error.response?.data);
  }

  // Test public endpoint (should work)
  try {
    const response3 = await axios.get('http://localhost:5000/api/category/all');
    console.log('✅ Public endpoint response:', response3.status, response3.data);
  } catch (error) {
    console.log('❌ Public endpoint error:', error.response?.status, error.response?.data);
  }
}

testAuth();
