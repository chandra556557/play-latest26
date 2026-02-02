/**
 * Database Connection Test
 * Tests if the backend can connect to the PostgreSQL database
 */

const testDatabaseConnection = async () => {
  console.log('🔍 Testing Database Connection...\n');

  // Test 1: Backend Health Check
  console.log('1️⃣ Testing backend health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend is running');
    console.log('   Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Backend is not responding');
    console.log('   Error:', error.message);
    console.log('\n⚠️  SOLUTION: Start the backend server:');
    console.log('   cd playwright-crx-enhanced\\backend');
    console.log('   npm start');
    return;
  }

  // Test 2: Try to register a new user (this will test DB write)
  console.log('\n2️⃣ Testing user registration (database write)...');
  const testEmail = `test${Date.now()}@example.com`;
  try {
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123!',
        name: 'Test User'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.status === 201) {
      console.log('✅ Database connection is working!');
      console.log('   User created:', testEmail);
      console.log('   Access token received:', registerData.accessToken ? 'Yes' : 'No');
    } else {
      console.log('❌ Registration failed');
      console.log('   Status:', registerResponse.status);
      console.log('   Response:', JSON.stringify(registerData, null, 2));
      
      if (registerData.error === '') {
        console.log('\n⚠️  LIKELY ISSUE: Database connection error');
        console.log('   The empty error suggests a database connectivity problem');
      }
    }
  } catch (error) {
    console.log('❌ Registration request failed');
    console.log('   Error:', error.message);
  }

  // Test 3: Try to login with demo credentials
  console.log('\n3️⃣ Testing login with demo credentials...');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
      console.log('   Access token received:', loginData.accessToken ? 'Yes' : 'No');
    } else if (loginResponse.status === 401) {
      console.log('⚠️  User credentials are invalid (this is expected if user doesn\'t exist)');
      console.log('   This means the database IS working, but the user doesn\'t exist');
    } else if (loginResponse.status === 400) {
      console.log('❌ 400 Bad Request');
      console.log('   Response:', JSON.stringify(loginData, null, 2));
      
      if (loginData.error === '') {
        console.log('\n⚠️  DATABASE CONNECTION ERROR DETECTED!');
        console.log('   The backend cannot connect to PostgreSQL');
      } else if (loginData.error === 'Validation error') {
        console.log('\n⚠️  VALIDATION ERROR');
        console.log('   Check that email and password are valid');
      }
    } else {
      console.log('❌ Unexpected response');
      console.log('   Status:', loginResponse.status);
      console.log('   Response:', JSON.stringify(loginData, null, 2));
    }
  } catch (error) {
    console.log('❌ Login request failed');
    console.log('   Error:', error.message);
  }

  // Diagnostics Summary
  console.log('\n\n📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('\nPossible causes of {"error":""} response:');
  console.log('  1. ❌ PostgreSQL database is not running');
  console.log('  2. ❌ DATABASE_URL environment variable is incorrect');
  console.log('  3. ❌ Database tables (User/users) do not exist');
  console.log('  4. ❌ Database connection timeout or network issue');
  console.log('\nHow to fix:');
  console.log('  1. Check if PostgreSQL is running:');
  console.log('     - Windows: Check Services for "postgresql"');
  console.log('     - Or check Docker if using docker-compose');
  console.log('  2. Verify DATABASE_URL in .env file:');
  console.log('     cd playwright-crx-enhanced\\backend');
  console.log('     type .env');
  console.log('  3. Check backend console for error logs');
  console.log('  4. Run database migrations:');
  console.log('     cd playwright-crx-enhanced\\backend');
  console.log('     npm run migrate');
  console.log('\n✅ Diagnostics complete!\n');
};

testDatabaseConnection();
