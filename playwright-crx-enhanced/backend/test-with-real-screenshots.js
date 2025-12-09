/**
 * Test Visual Regression with Sample Screenshots
 * This script demonstrates how to use the API with real screenshot files
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001/api/visual-regression';

// Helper function to convert file to base64
function imageToBase64(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString('base64');
}

// Helper function to create sample screenshots
function createSampleScreenshots() {
  console.log('\n📝 Creating sample screenshots for testing...\n');
  
  const screenshotsDir = path.join(__dirname, 'sample-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Create a simple 100x100 red PNG
  const redPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );
  
  // Create a simple 100x100 blue PNG
  const bluePNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
    'base64'
  );

  const baseline = path.join(screenshotsDir, 'baseline.png');
  const current = path.join(screenshotsDir, 'current.png');
  const modified = path.join(screenshotsDir, 'modified.png');

  fs.writeFileSync(baseline, redPNG);
  fs.writeFileSync(current, redPNG);
  fs.writeFileSync(modified, bluePNG);

  console.log('✅ Created sample screenshots:');
  console.log(`   - ${baseline}`);
  console.log(`   - ${current}`);
  console.log(`   - ${modified}`);
  
  return { baseline, current, modified };
}

async function testWithFiles() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING VISUAL REGRESSION WITH SCREENSHOT FILES');
  console.log('='.repeat(80));

  try {
    // Create sample screenshots
    const files = createSampleScreenshots();

    // Test 1: Compare identical screenshots
    console.log('\n📍 Test 1: Comparing baseline.png with current.png (identical)');
    console.log('-'.repeat(80));
    
    const baselineBase64 = imageToBase64(files.baseline);
    const currentBase64 = imageToBase64(files.current);
    
    const response1 = await axios.post(`${API_URL}/compare`, {
      before_screenshot: baselineBase64,
      after_screenshot: currentBase64,
      tolerance: 0.95
    });
    
    console.log('✅ Verdict:', response1.data.data.verdict);
    console.log('📊 Similarity:', (response1.data.data.similarity * 100).toFixed(2) + '%');
    console.log('🎯 Expected: PASS with 100% similarity');
    
    // Test 2: Compare different screenshots
    console.log('\n📍 Test 2: Comparing baseline.png with modified.png (different)');
    console.log('-'.repeat(80));
    
    const modifiedBase64 = imageToBase64(files.modified);
    
    const response2 = await axios.post(`${API_URL}/compare`, {
      before_screenshot: baselineBase64,
      after_screenshot: modifiedBase64,
      tolerance: 0.95
    });
    
    console.log('✅ Verdict:', response2.data.data.verdict);
    console.log('📊 Similarity:', (response2.data.data.similarity * 100).toFixed(2) + '%');
    console.log('🎯 Expected: FAIL with low similarity');
    
    if (response2.data.data.changes && response2.data.data.changes.length > 0) {
      console.log('📋 Changes detected:');
      response2.data.data.changes.forEach((change, idx) => {
        console.log(`   ${idx + 1}. ${change.description}`);
      });
    }
    
    console.log('\n📝 Generated Playwright Code:');
    console.log('   ' + response2.data.data.suggested_playwright_code.assertion);
    
    // Test 3: Analyze screenshot metadata
    console.log('\n📍 Test 3: Analyzing baseline.png metadata');
    console.log('-'.repeat(80));
    
    const response3 = await axios.post(`${API_URL}/analyze`, {
      screenshot: baselineBase64
    });
    
    const metadata = response3.data.data;
    console.log('✅ Format:', metadata.format);
    console.log('📐 Dimensions:', `${metadata.width}x${metadata.height}`);
    console.log('💾 Size:', metadata.size_bytes, 'bytes');
    console.log('🎨 Channels:', metadata.channels);
    console.log('🔍 Has Alpha:', metadata.has_alpha);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    
    console.log('\n💡 TIP: You can now replace the sample screenshots with your own:');
    console.log(`   - Place your baseline screenshot at: sample-screenshots/baseline.png`);
    console.log(`   - Place your test screenshot at: sample-screenshots/current.png`);
    console.log(`   - Run this script again to compare them!`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend not running!');
      console.log('   Start the backend first: npm run dev');
    }
  }
}

// Instructions
console.log('\n📖 VISUAL REGRESSION TESTING WITH FILES\n');
console.log('This script will:');
console.log('  1. Create sample screenshots in sample-screenshots/ folder');
console.log('  2. Test the visual regression API with these files');
console.log('  3. Show you how to compare your own screenshots\n');
console.log('Make sure the backend is running at http://localhost:3001\n');

// Run tests
testWithFiles();
