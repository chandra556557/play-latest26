/**
 * Test Visual Regression API
 * Quick test script to verify screenshot comparison works
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001/api/visual-regression';

// Sample 1x1 pixel PNG images (base64 encoded)
const RED_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const BLUE_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==';

console.log('\n' + '='.repeat(80));
console.log('🧪 TESTING VISUAL REGRESSION API (Node.js Backend)');
console.log('='.repeat(80));

async function testHealthCheck() {
  console.log('\n📍 Test 1: Health Check');
  console.log('-'.repeat(80));
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Status:', response.data.success ? 'OK' : 'FAILED');
    console.log('📊 Features:', response.data.data.features.join(', '));
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testIdenticalScreenshots() {
  console.log('\n📍 Test 2: Compare Identical Screenshots (Should PASS)');
  console.log('-'.repeat(80));
  
  try {
    const response = await axios.post(`${API_URL}/compare`, {
      before_screenshot: RED_PIXEL,
      after_screenshot: RED_PIXEL,
      tolerance: 0.95
    });
    
    const result = response.data.data;
    console.log('✅ Verdict:', result.verdict);
    console.log('📊 Similarity:', (result.similarity * 100).toFixed(2) + '%');
    console.log('🎯 Expected: PASS with 100% similarity');
    
    if (result.verdict === 'PASS' && result.similarity === 1.0) {
      console.log('✅ Test PASSED');
      return true;
    } else {
      console.log('❌ Test FAILED - unexpected result');
      return false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testDifferentScreenshots() {
  console.log('\n📍 Test 3: Compare Different Screenshots (Should FAIL)');
  console.log('-'.repeat(80));
  
  try {
    const response = await axios.post(`${API_URL}/compare`, {
      before_screenshot: RED_PIXEL,
      after_screenshot: BLUE_PIXEL,
      tolerance: 0.95
    });
    
    const result = response.data.data;
    console.log('✅ Verdict:', result.verdict);
    console.log('📊 Similarity:', (result.similarity * 100).toFixed(2) + '%');
    console.log('🎯 Expected: FAIL with low similarity');
    
    if (result.changes && result.changes.length > 0) {
      console.log('📋 Changes detected:');
      result.changes.forEach((change, idx) => {
        console.log(`   ${idx + 1}. ${change.description}`);
      });
    }
    
    if (result.verdict === 'FAIL') {
      console.log('✅ Test PASSED');
      return true;
    } else {
      console.log('❌ Test FAILED - expected FAIL verdict');
      return false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testScreenshotAnalysis() {
  console.log('\n📍 Test 4: Screenshot Metadata Analysis');
  console.log('-'.repeat(80));
  
  try {
    const response = await axios.post(`${API_URL}/analyze`, {
      screenshot: RED_PIXEL
    });
    
    const result = response.data.data;
    console.log('✅ Format:', result.format);
    console.log('📐 Dimensions:', `${result.width}x${result.height}`);
    console.log('💾 Size:', result.size_bytes, 'bytes');
    console.log('🎨 Channels:', result.channels);
    return true;
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testPlaywrightCodeGeneration() {
  console.log('\n📍 Test 5: Playwright Code Generation');
  console.log('-'.repeat(80));
  
  try {
    const response = await axios.post(`${API_URL}/compare`, {
      before_screenshot: RED_PIXEL,
      after_screenshot: BLUE_PIXEL,
      tolerance: 0.90
    });
    
    const result = response.data.data;
    
    if (result.suggested_playwright_code) {
      console.log('📝 Generated Playwright Code:');
      console.log('   ' + result.suggested_playwright_code.assertion);
      console.log('');
      console.log('⚙️  Suggested Options:');
      console.log('   ' + result.suggested_playwright_code.options);
      console.log('✅ Test PASSED');
      return true;
    } else {
      console.log('❌ No Playwright code generated');
      return false;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting Visual Regression API Tests...\n');
  
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testIdenticalScreenshots());
  results.push(await testDifferentScreenshots());
  results.push(await testScreenshotAnalysis());
  results.push(await testPlaywrightCodeGeneration());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log('='.repeat(80));
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Visual Regression API is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the output above.\n');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
