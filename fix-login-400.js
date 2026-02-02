/**
 * Quick Fix for Login 400 Error
 * This script will:
 * 1. Test PostgreSQL connection
 * 2. Create the database if it doesn't exist
 * 3. Create the User table if it doesn't exist
 * 4. Create a test user for login
 */

const { Client } = require('pg');

const DB_HOST = 'localhost';
const DB_PORT = 5432;
const DB_NAME = 'playwrightcrx1';
const DB_USER = 'postgres';
const DB_PASSWORD = 'root';

async function fixLoginIssue() {
  console.log('🔧 Starting Login 400 Error Fix...\n');

  // Step 1: Connect to PostgreSQL (to postgres database first)
  console.log('1️⃣ Testing PostgreSQL connection...');
  const adminClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres' // Connect to default database first
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // Step 2: Check if database exists
    console.log('2️⃣ Checking if database exists...');
    const dbCheckResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (dbCheckResult.rowCount === 0) {
      console.log(`⚠️  Database '${DB_NAME}' does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✅ Database '${DB_NAME}' created successfully!\n`);
    } else {
      console.log(`✅ Database '${DB_NAME}' already exists\n`);
    }

    await adminClient.end();

  } catch (error) {
    console.log('❌ Failed to connect to PostgreSQL:');
    console.log('   Error:', error.message);
    console.log('\n⚠️  SOLUTIONS:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your credentials in .env file');
    console.log('   3. Verify DB_PASSWORD is correct');
    await adminClient.end();
    return;
  }

  // Step 3: Connect to the application database
  console.log('3️⃣ Connecting to application database...');
  const appClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  });

  try {
    await appClient.connect();
    console.log('✅ Connected to application database!\n');

    // Step 4: Check if User table exists
    console.log('4️⃣ Checking if User table exists...');
    const tableCheckResult = await appClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );
    `);

    const tableExists = tableCheckResult.rows[0].exists;

    if (!tableExists) {
      console.log('⚠️  User table does not exist. Creating...');
      
      // Create User table
      await appClient.query(`
        CREATE TABLE "User" (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ User table created successfully!\n');
    } else {
      console.log('✅ User table already exists\n');
    }

    // Step 5: Create test user
    console.log('5️⃣ Creating test user (demo@example.com)...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const { randomUUID } = require('crypto');
    const userId = randomUUID();

    try {
      await appClient.query(`
        INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `, [userId, 'demo@example.com', hashedPassword, 'Demo User']);
      
      console.log('✅ Test user created (or already exists)');
      console.log('   Email: demo@example.com');
      console.log('   Password: demo123\n');
    } catch (error) {
      console.log('⚠️  Could not create test user:', error.message);
    }

    // Step 6: Create RefreshToken table if needed
    console.log('6️⃣ Checking RefreshToken table...');
    const refreshTokenTableCheck = await appClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'RefreshToken'
      );
    `);

    if (!refreshTokenTableCheck.rows[0].exists) {
      console.log('⚠️  RefreshToken table does not exist. Creating...');
      
      await appClient.query(`
        CREATE TABLE "RefreshToken" (
          id VARCHAR(255) PRIMARY KEY,
          token TEXT NOT NULL,
          "userId" VARCHAR(255) NOT NULL,
          "expiresAt" TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "revokedAt" TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        );
      `);
      
      console.log('✅ RefreshToken table created successfully!\n');
    } else {
      console.log('✅ RefreshToken table already exists\n');
    }

    await appClient.end();

    // Step 7: Test login
    console.log('7️⃣ Testing login with demo user...');
    const testResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });

    const testData = await testResponse.json();
    
    if (testResponse.status === 200) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   Access Token:', testData.accessToken ? 'Generated' : 'Missing');
      console.log('   User:', testData.user?.email);
      console.log('\n🎉 Fix completed successfully!');
      console.log('\n📋 You can now login with:');
      console.log('   Email: demo@example.com');
      console.log('   Password: demo123');
    } else {
      console.log('❌ Login still failing');
      console.log('   Status:', testResponse.status);
      console.log('   Response:', JSON.stringify(testData, null, 2));
      console.log('\n⚠️  Please check backend console logs for more details');
    }

  } catch (error) {
    console.log('❌ Error during database setup:');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
    await appClient.end();
  }

  console.log('\n✅ Fix script completed!\n');
}

fixLoginIssue().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
