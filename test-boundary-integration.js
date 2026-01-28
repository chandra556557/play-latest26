/**
 * Simple Boundary Test Case Integration Test
 * Quick test to verify boundary data generation works end-to-end
 */

const axios = require('axios');

const PYTHON_API = 'http://localhost:3000/genieapi/assistant/testdata/boundary/generate';

const TEST_SCRIPT = `
import { test } from '@playwright/test';

test('login', async ({ page }) => {
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
});
`;

async function testBoundaryGeneration() {
  console.log('╔═════════════════════════════════════════════════════════════╗');
  console.log('║   🧪 BOUNDARY TEST DATA - INTEGRATION TEST                 ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');
  
  console.log('📍 Testing External Python API');
  console.log(`   Endpoint: ${PYTHON_API}\n`);
  
  const payload = {
    scriptCode: TEST_SCRIPT,
    template: {},
    count: 5,
    testDataType: 'boundary',
    options: {}
  };
  
  console.log('📤 Sending request...\n');
  
  try {
    const response = await axios.post(PYTHON_API, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    const result = response.data;
    
    console.log('✅ SUCCESS!\n');
    console.log('═'.repeat(65));
    console.log('📊 RESPONSE METADATA');
    console.log('═'.repeat(65));
    console.log(`Success:          ${result.success}`);
    console.log(`Records:          ${result.data?.length || 0}`);
    console.log(`Fields Detected:  ${result.metadata?.fields_detected?.join(', ') || 'None'}`);
    console.log(`Test Type:        ${result.metadata?.testDataType || 'N/A'}`);
    console.log(`Generated At:     ${result.metadata?.generated_at || 'N/A'}`);
    
    if (result.data && result.data.length > 0) {
      console.log('\n' + '═'.repeat(65));
      console.log('🧪 BOUNDARY TEST CASES');
      console.log('═'.repeat(65) + '\n');
      
      result.data.forEach((record, i) => {
        console.log(`Test Case #${i + 1} (Index: ${record._index})`);
        console.log('─'.repeat(65));
        
        Object.entries(record).forEach(([key, value]) => {
          if (!key.startsWith('_')) {
            const category = getBoundaryCategory(value);
            console.log(`  ${key.padEnd(12)}: "${value}".padEnd(30) [${category}]`);
          }
        });
        console.log('');
      });
      
      // Verify actual field data
      const firstRecord = result.data[0];
      const fields = Object.keys(firstRecord).filter(k => !k.startsWith('_'));
      
      if (fields.length > 0) {
        console.log('═'.repeat(65));
        console.log('✅ VALIDATION: PASSED');
        console.log('═'.repeat(65));
        console.log(`✓ External API successfully generated field data`);
        console.log(`✓ Fields: ${fields.join(', ')}`);
        console.log(`✓ ${result.data.length} boundary test cases created`);
        
        console.log('\n📈 BOUNDARY COVERAGE:');
        fields.forEach(field => {
          const values = result.data.map(r => r[field]);
          console.log(`\n  ${field}:`);
          console.log(`    • Empty values: ${values.filter(v => v === '').length}`);
          console.log(`    • Short values: ${values.filter(v => v && v.length <= 2).length}`);
          console.log(`    • Valid values: ${values.filter(v => v && v.length > 2 && v.length <= 30).length}`);
          console.log(`    • Long values:  ${values.filter(v => v && v.length > 30).length}`);
        });
        
        console.log('\n' + '═'.repeat(65));
        console.log('🎉 INTEGRATION TEST PASSED!');
        console.log('═'.repeat(65));
        console.log('\n✅ The external Python API is working correctly!');
        console.log('✅ Boundary test data is being generated properly!');
        console.log('✅ Fields are being detected automatically!');
        
      } else {
        console.log('═'.repeat(65));
        console.log('❌ VALIDATION: FAILED');
        console.log('═'.repeat(65));
        console.log('⚠️  Only metadata returned (no actual field data)');
        console.log('⚠️  External API may need troubleshooting');
      }
    }
    
  } catch (error) {
    console.log('═'.repeat(65));
    console.log('❌ ERROR');
    console.log('═'.repeat(65) + '\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection Refused\n');
      console.log('The Python External API is not running.\n');
      console.log('To start it:');
      console.log('  1. cd genie-api-service');
      console.log('  2. python -m venv venv');
      console.log('  3. venv\\Scripts\\activate  (Windows)');
      console.log('  4. pip install -r requirements.txt');
      console.log('  5. Copy .env.example to .env and add your OpenAI API key');
      console.log('  6. python main.py\n');
      
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Request Timeout\n');
      console.log('The request took too long (>30 seconds).');
      console.log('This may happen if:');
      console.log('  • GPT-4 analysis is slow');
      console.log('  • OpenAI API is having issues');
      console.log('  • Network connectivity problems\n');
      
    } else if (error.response) {
      console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}\n`);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
      
    } else {
      console.log(`❌ ${error.message}\n`);
    }
    
    process.exit(1);
  }
}

function getBoundaryCategory(value) {
  if (value === '') return 'Empty/Null';
  if (value.length <= 2) return 'Minimal';
  if (value.length > 30) return 'Maximum';
  return 'Valid Boundary';
}

// Run the test
testBoundaryGeneration();
