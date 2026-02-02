import { DatabaseTestingService, PerformanceTestConfig, LoadTestConfig } from '../services/database-testing.service';

/**
 * Database Testing Examples
 * 
 * This file demonstrates practical usage of the DatabaseTestingService
 * for different testing scenarios and use cases.
 */

// Initialize the testing service
const testingService = new DatabaseTestingService();

/**
 * Example 1: Basic Unit Testing for Script Operations
 * Tests individual database operations for script management
 */
export async function runScriptUnitTests() {
  console.log('🧪 Running Script Unit Tests...');
  
  try {
    const unitTestResults = await testingService.runUnitTests();
    
    console.log('✅ Unit Test Results:', {
      totalTests: unitTestResults.length,
      passedTests: unitTestResults.filter(r => r.success).length,
      failedTests: unitTestResults.filter(r => !r.success).length,
      averageExecutionTime: unitTestResults.reduce((sum, r) => sum + r.executionTime, 0) / unitTestResults.length
    });
    
    return unitTestResults;
  } catch (error: any) {
    console.error('❌ Unit tests failed:', error);
    throw error;
  }
}

/**
 * Example 2: Integration Testing for Repository Analytics
 * Tests the integration between repositories and analytics tables
 */
export async function runRepositoryAnalyticsIntegrationTests() {
  console.log('🔗 Running Repository Analytics Integration Tests...');
  
  try {
    const integrationResults = await testingService.runIntegrationTests();
    
    console.log('✅ Integration Test Results:', {
      totalTests: integrationResults.length,
      passedTests: integrationResults.filter(r => r.success).length
    });
    
    return integrationResults;
  } catch (error: any) {
    console.error('❌ Integration tests failed:', error);
    throw error;
  }
}

/**
 * Example 3: Performance Testing for Analytics Queries
 * Tests query performance on analytics data
 */
export async function runAnalyticsPerformanceTests() {
  console.log('⚡ Running Analytics Performance Tests...');
  
  try {
    const configs: PerformanceTestConfig[] = [
      { query: 'SELECT COUNT(*) FROM test_data_repositories', iterations: 100, concurrentUsers: 10, expectedMaxTime: 200 },
      { query: 'SELECT * FROM test_data_repositories WHERE quality_score > 80', iterations: 50, concurrentUsers: 5, expectedMaxTime: 300 }
    ];
    const performanceResults = await testingService.runPerformanceTests(configs);
    
    console.log('✅ Performance Test Results:', {
      totalQueries: performanceResults.length,
      averageExecutionTime: performanceResults.reduce((sum, r) => sum + r.executionTime, 0) / performanceResults.length,
      slowQueries: performanceResults.filter(r => r.executionTime > 1000).length,
      fastestQuery: Math.min(...performanceResults.map(r => r.executionTime)),
      slowestQuery: Math.max(...performanceResults.map(r => r.executionTime))
    });
    
    return performanceResults;
  } catch (error: any) {
    console.error('❌ Performance tests failed:', error);
    throw error;
  }
}

/**
 * Example 4: Load Testing for User Operations
 * Tests database performance under concurrent user load
 */
export async function runUserLoadTests() {
  console.log('👥 Running User Load Tests...');
  
  try {
    const loadConfigs: LoadTestConfig[] = [
      { tableName: 'load_test_table', initialRecordCount: 1000, batchSize: 100, concurrentConnections: 50, duration: 30 }
    ];
    const loadResults = await testingService.runLoadTests(loadConfigs);
    
    console.log('✅ Load Test Results:', {
      totalConnections: loadResults.length,
      successfulConnections: loadResults.filter(r => r.success).length,
      failedConnections: loadResults.filter(r => !r.success).length,
      averageResponseTime: loadResults.reduce((sum, r) => sum + r.executionTime, 0) / loadResults.length,
      maxResponseTime: Math.max(...loadResults.map(r => r.executionTime)),
      minResponseTime: Math.min(...loadResults.map(r => r.executionTime))
    });
    
    return loadResults;
  } catch (error: any) {
    console.error('❌ Load tests failed:', error);
    throw error;
  }
}

/**
 * Example 5: Security Testing for SQL Injection Prevention
 * Tests database security against SQL injection attacks
 */
export async function runSecurityTests() {
  console.log('🔒 Running Security Tests...');
  
  try {
    const securityResults = await testingService.runSecurityTests();
    
    console.log('✅ Security Test Results:', {
      totalTests: securityResults.length,
      injectionAttempts: securityResults.filter(r => r.testName === 'SQL Injection Prevention').length,
      blockedInjections: securityResults.filter(r => r.testName === 'SQL Injection Prevention' && r.success).length,
      dataValidationTests: securityResults.filter(r => r.testName?.toLowerCase().includes('validation')).length,
      encryptionTests: securityResults.filter(r => r.testName?.toLowerCase().includes('encryption')).length
    });
    
    return securityResults;
  } catch (error: any) {
    console.error('❌ Security tests failed:', error);
    throw error;
  }
}

/**
 * Example 6: Data Integrity Testing
 * Tests database constraints and data validation
 */
export async function runDataIntegrityTests() {
  console.log('🔍 Running Data Integrity Tests...');
  
  try {
    const integrityResults = await testingService.runDataIntegrityTests();
    
    console.log('✅ Data Integrity Test Results:', {
      totalTests: integrityResults.length,
      foreignKeyTests: integrityResults.filter(r => r.testName?.toLowerCase().includes('foreign key')).length,
      uniqueConstraintTests: integrityResults.filter(r => r.testName?.toLowerCase().includes('unique')).length,
      dataTypeTests: integrityResults.filter(r => r.testName?.toLowerCase().includes('data type')).length,
      checkConstraintTests: integrityResults.filter(r => r.testName?.toLowerCase().includes('check')).length
    });
    
    return integrityResults;
  } catch (error: any) {
    console.error('❌ Data integrity tests failed:', error);
    throw error;
  }
}

/**
 * Example 7: Comprehensive Test Suite
 * Runs all testing types in sequence
 */
export async function runComprehensiveTestSuite() {
  console.log('🚀 Running Comprehensive Database Test Suite...');
  
  try {
    const suite = await testingService.runComprehensiveTestSuite();
    console.log('🎯 Comprehensive Test Suite Results:', {
      totalTests: suite.results.length,
      passedTests: suite.results.filter(r => r.success).length,
      failedTests: suite.results.filter(r => !r.success).length,
      summary: suite.summary
    });
    return suite.results;
  } catch (error: any) {
    console.error('❌ Comprehensive test suite failed:', error);
    throw error;
  }
}

/**
 * Example 8: Custom Test Scenario - Repository Migration Testing
 * Tests database operations during repository migration
 */
export async function runRepositoryMigrationTests() {
  console.log('📦 Running Repository Migration Tests...');
  
  try {
    const migrationResults = await testingService.runIntegrationTests();
    
    console.log('✅ Migration Test Results:', {
      totalMigrationTests: migrationResults.length,
      successfulMigrations: migrationResults.filter(r => r.success).length,
      failedMigrations: migrationResults.filter(r => !r.success).length,
      averageMigrationTime: migrationResults.reduce((sum, r) => sum + r.executionTime, 0) / migrationResults.length
    });
    
    return migrationResults;
  } catch (error: any) {
    console.error('❌ Migration tests failed:', error);
    throw error;
  }
}

/**
 * Main execution function to run all examples
 */
export async function runAllExamples() {
  console.log('🎯 Starting Database Testing Examples...\n');
  
  const results: Record<string, any> = {};
  
  try {
    // Run individual test examples
    results.scriptUnitTests = await runScriptUnitTests();
    console.log('');
    
    results.integrationTests = await runRepositoryAnalyticsIntegrationTests();
    console.log('');
    
    results.performanceTests = await runAnalyticsPerformanceTests();
    console.log('');
    
    results.loadTests = await runUserLoadTests();
    console.log('');
    
    results.securityTests = await runSecurityTests();
    console.log('');
    
    results.dataIntegrityTests = await runDataIntegrityTests();
    console.log('');
    
    // Run comprehensive test suite
    results.comprehensiveTests = await runComprehensiveTestSuite();
    console.log('');
    
    // Run custom migration tests
    results.migrationTests = await runRepositoryMigrationTests();
    console.log('');
    
    // Summary
    console.log('📊 All Database Testing Examples Completed!');
    console.log('================================================');
    console.log(`Total Test Suites: ${Object.keys(results).length}`);
    const allResults = [
      ...results.scriptUnitTests,
      ...results.integrationTests,
      ...results.performanceTests,
      ...results.loadTests,
      ...results.securityTests,
      ...results.dataIntegrityTests,
      ...results.comprehensiveTests,
      ...results.migrationTests
    ];
    console.log(`Total Tests: ${allResults.length}`);
    console.log(`Passed Tests: ${allResults.filter((r: any) => r.success).length}`);
    console.log(`Failed Tests: ${allResults.filter((r: any) => !r.success).length}`);
    
    return results;
  } catch (error: any) {
    console.error('❌ Examples execution failed:', error);
    throw error;
  }
}

// Export for use in other modules
export default {
  runScriptUnitTests,
  runRepositoryAnalyticsIntegrationTests,
  runAnalyticsPerformanceTests,
  runUserLoadTests,
  runSecurityTests,
  runDataIntegrityTests,
  runComprehensiveTestSuite,
  runRepositoryMigrationTests,
  runAllExamples
};