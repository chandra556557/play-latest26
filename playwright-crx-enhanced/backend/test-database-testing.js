/**
 * Database Testing Service Demo
 * 
 * This script demonstrates the database testing service functionality
 * with practical examples and real test execution.
 */

const { DatabaseTestingService, DatabaseTestType, TestDataCategory } = require('./src/services/database-testing.service');
const { pool } = require('./src/db');

async function demonstrateDatabaseTesting() {
  console.log('🚀 Database Testing Service Demo\n');
  
  try {
    // Initialize the testing service
    const testingService = new DatabaseTestingService(pool);
    
    console.log('📊 Test Data Generation Examples:');
    console.log('=====================================');
    
    // Example 1: Generate different types of test data
    console.log('\n1️⃣ Generating User Test Data:');
    const userData = await testingService.generateTestData(TestDataCategory.USERS, 5);
    console.log(`Generated ${userData.length} user records:`);
    userData.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email})`);
    });
    
    console.log('\n2️⃣ Generating Script Test Data:');
    const scriptData = await testingService.generateTestData(TestDataCategory.SCRIPTS, 3);
    console.log(`Generated ${scriptData.length} script records:`);
    scriptData.forEach((script, index) => {
      console.log(`  ${index + 1}. ${script.script_name} (${script.script_type})`);
    });
    
    console.log('\n3️⃣ Generating Analytics Test Data:');
    const analyticsData = await testingService.generateTestData(TestDataCategory.ANALYTICS, 5);
    console.log(`Generated ${analyticsData.length} analytics records`);
    
    console.log('\n🧪 Running Database Tests:');
    console.log('==========================');
    
    // Example 2: Run unit tests
    console.log('\n4️⃣ Running Unit Tests:');
    const unitTestResults = await testingService.runUnitTests(userData.slice(0, 3));
    console.log(`Unit Tests: ${unitTestResults.filter(r => r.passed).length}/${unitTestResults.length} passed`);
    unitTestResults.forEach(result => {
      console.log(`  ${result.testName}: ${result.passed ? '✅' : '❌'} (${result.executionTime}ms)`);
    });
    
    // Example 3: Run integration tests
    console.log('\n5️⃣ Running Integration Tests:');
    const integrationData = [...userData.slice(0, 2), ...scriptData.slice(0, 2)];
    const integrationResults = await testingService.runIntegrationTests(integrationData);
    console.log(`Integration Tests: ${integrationResults.filter(r => r.passed).length}/${integrationResults.length} passed`);
    
    // Example 4: Run performance tests
    console.log('\n6️⃣ Running Performance Tests:');
    const performanceResults = await testingService.runPerformanceTests(analyticsData);
    const avgPerformance = performanceResults.reduce((sum, r) => sum + r.executionTime, 0) / performanceResults.length;
    console.log(`Performance Tests: ${performanceResults.length} queries executed`);
    console.log(`Average execution time: ${avgPerformance.toFixed(2)}ms`);
    console.log(`Slowest query: ${Math.max(...performanceResults.map(r => r.executionTime))}ms`);
    console.log(`Fastest query: ${Math.min(...performanceResults.map(r => r.executionTime))}ms`);
    
    // Example 5: Run security tests
    console.log('\n7️⃣ Running Security Tests:');
    const maliciousData = [
      { username: "admin'; DROP TABLE users; --", email: "attack@example.com" },
      { username: "user'; SELECT * FROM passwords; --", email: "data@example.com" }
    ];
    const securityTestData = [...userData.slice(0, 2), ...maliciousData];
    const securityResults = await testingService.runSecurityTests(securityTestData);
    console.log(`Security Tests: ${securityResults.filter(r => r.passed).length}/${securityResults.length} passed`);
    
    // Example 6: Run data integrity tests
    console.log('\n8️⃣ Running Data Integrity Tests:');
    const integrityViolations = [
      { username: null, email: "duplicate@example.com" },
      { username: "user1", email: "duplicate@example.com" } // Duplicate email
    ];
    const integrityTestData = [...userData.slice(0, 2), ...integrityViolations];
    const integrityResults = await testingService.runDataIntegrityTests(integrityTestData);
    console.log(`Data Integrity Tests: ${integrityResults.filter(r => r.passed).length}/${integrityResults.length} passed`);
    
    // Example 7: Run comprehensive test suite
    console.log('\n9️⃣ Running Comprehensive Test Suite:');
    const comprehensiveData = [
      ...userData,
      ...scriptData,
      ...analyticsData
    ];
    const comprehensiveResults = await testingService.runComprehensiveTestSuite(comprehensiveData);
    
    const testTypeSummary = {};
    comprehensiveResults.forEach(result => {
      if (!testTypeSummary[result.testType]) {
        testTypeSummary[result.testType] = { total: 0, passed: 0 };
      }
      testTypeSummary[result.testType].total++;
      if (result.passed) testTypeSummary[result.testType].passed++;
    });
    
    console.log('Comprehensive Test Results Summary:');
    Object.entries(testTypeSummary).forEach(([testType, summary]) => {
      console.log(`  ${testType}: ${summary.passed}/${summary.total} passed`);
    });
    
    console.log('\n📈 Final Summary:');
    console.log('================');
    console.log(`Total tests executed: ${comprehensiveResults.length}`);
    console.log(`Passed tests: ${comprehensiveResults.filter(r => r.passed).length}`);
    console.log(`Failed tests: ${comprehensiveResults.filter(r => !r.passed).length}`);
    console.log(`Success rate: ${((comprehensiveResults.filter(r => r.passed).length / comprehensiveResults.length) * 100).toFixed(1)}%`);
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await testingService.cleanupTestData();
    console.log('Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Close database connection
    await pool.end();
    console.log('\n✅ Database connection closed.');
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  demonstrateDatabaseTesting()
    .then(() => {
      console.log('\n🎉 Database Testing Demo completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Database Testing Demo failed:', error);
      process.exit(1);
    });
}

module.exports = { demonstrateDatabaseTesting };