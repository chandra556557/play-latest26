/**
 * Login 400 Error Diagnostic Tool
 * This script helps identify why you're getting a 400 Bad Request error
 */

const diagnoseFetch = async () => {
  console.log('🔍 Starting Login Diagnostics...\n');

  const testCases = [
    {
      name: 'Valid Email & Password',
      data: {
        email: 'test@example.com',
        password: 'Test123!'
      }
    },
    {
      name: 'Invalid Email Format',
      data: {
        email: 'invalid-email',
        password: 'Test123!'
      }
    },
    {
      name: 'Empty Password',
      data: {
        email: 'test@example.com',
        password: ''
      }
    },
    {
      name: 'Missing Email Field',
      data: {
        password: 'Test123!'
      }
    },
    {
      name: 'Missing Password Field',
      data: {
        email: 'test@example.com'
      }
    },
    {
      name: 'Wrong Content-Type Header',
      data: {
        email: 'test@example.com',
        password: 'Test123!'
      },
      headers: {
        'Content-Type': 'text/plain'
      }
    },
    {
      name: 'Missing Content-Type Header',
      data: {
        email: 'test@example.com',
        password: 'Test123!'
      },
      headers: {}
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('─'.repeat(50));

    try {
      const headers = testCase.headers || {
        'Content-Type': 'application/json'
      };

      const requestBody = JSON.stringify(testCase.data);
      
      console.log('Request Details:');
      console.log('  URL:', 'http://localhost:3001/api/auth/login');
      console.log('  Method:', 'POST');
      console.log('  Headers:', JSON.stringify(headers, null, 2));
      console.log('  Body:', requestBody);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log('\nResponse:');
      console.log('  Status:', response.status, response.statusText);
      console.log('  Data:', JSON.stringify(responseData, null, 2));

      if (response.status === 400) {
        console.log('\n⚠️  400 ERROR DETECTED:');
        if (responseData.error === 'Validation error' && responseData.details) {
          console.log('  Validation Issues:');
          responseData.details.forEach(detail => {
            console.log(`    - Field: ${detail.field || 'unknown'}`);
            console.log(`      Message: ${detail.message}`);
          });
        } else {
          console.log('  Error:', responseData.error || responseData);
        }
      } else if (response.status === 401) {
        console.log('\n❌ 401 UNAUTHORIZED (Invalid credentials)');
      } else if (response.ok) {
        console.log('\n✅ SUCCESS');
      }

    } catch (error) {
      console.log('\n❌ Request Failed:');
      console.log('  Error:', error.message);
      console.log('  This might indicate:');
      console.log('    - Backend server is not running');
      console.log('    - Network connectivity issue');
      console.log('    - CORS issue');
    }
  }

  console.log('\n\n📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  console.log('\nCommon causes of 400 Bad Request:');
  console.log('  1. ❌ Invalid email format (must be valid email)');
  console.log('  2. ❌ Missing email or password in request body');
  console.log('  3. ❌ Empty password field');
  console.log('  4. ❌ Wrong Content-Type header (must be application/json)');
  console.log('  5. ❌ Malformed JSON in request body');
  console.log('\nValidation Requirements:');
  console.log('  ✓ Email: Must be valid email format (e.g., user@example.com)');
  console.log('  ✓ Password: Must not be empty');
  console.log('  ✓ Content-Type: Must be "application/json"');
  console.log('  ✓ Request body: Must be valid JSON');
  console.log('\nExpected Request Format:');
  console.log(`
  POST http://localhost:3001/api/auth/login
  Headers: {
    "Content-Type": "application/json"
  }
  Body: {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  `);

  console.log('\n💡 TO DEBUG YOUR SPECIFIC REQUEST:');
  console.log('  1. Open Browser DevTools (F12)');
  console.log('  2. Go to Network tab');
  console.log('  3. Try to login');
  console.log('  4. Click on the failed "login" request');
  console.log('  5. Check:');
  console.log('     - Request Headers (Content-Type should be application/json)');
  console.log('     - Request Payload (check email and password fields)');
  console.log('     - Response (look for validation error details)');

  console.log('\n✅ Diagnostics complete!\n');
};

// Run diagnostics
diagnoseFetch().catch(err => {
  console.error('Fatal error during diagnostics:', err);
});
