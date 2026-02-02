const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'playwright_crx1',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // First, run the complete schema migration
    const completeSchemaSql = fs.readFileSync(
      path.join(__dirname, 'migrations', '008_complete_schema_latest.sql'),
      'utf8'
    );
    console.log('🚀 Running complete schema migration...');
    await client.query(completeSchemaSql);
    console.log('✅ Base schema created');

    // Then run the Object Repository migration
    const objRepoSql = fs.readFileSync(
      path.join(__dirname, 'migrations', '006_create_object_repository.sql'),
      'utf8'
    );
    console.log('🚀 Running Object Repository migration...');
    await client.query(objRepoSql);
    
    console.log('✅ Object Repository tables created successfully!');
    console.log('');
    console.log('📦 Created tables:');
    console.log('  - page_objects');
    console.log('  - ui_elements');
    console.log('  - alternative_locators');
    console.log('  - element_usage_history');
    console.log('');
    console.log('🎉 Migration complete! Refresh your browser to see the Object Repository.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
