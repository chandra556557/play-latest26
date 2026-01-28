import { Request, Response } from 'express';
import { DatabaseTestingService, DatabaseTestType, TestDataCategory, PerformanceTestConfig, LoadTestConfig } from '../services/database-testing.service';

const testingService = new DatabaseTestingService();

/**
 * Database Testing Controller
 * Handles all database testing API endpoints
 */
export class DatabaseTestingController {
  /**
   * Generate test data for specified category
   */
  async generateTestData(req: Request, res: Response): Promise<void> {
    try {
      const { category, count = 10 } = req.body;
      
      if (!category || !Object.values(TestDataCategory).includes(category)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing category. Valid categories: ' + Object.values(TestDataCategory).join(', ')
        });
        return;
      }

      const testData = await testingService.generateTestData({ category, count: Number(count) });
      
      res.json({
        success: true,
        data: testData,
        count: testData.length,
        category
      });
    } catch (error: any) {
      console.error('Error generating test data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate test data',
          details: error.message
      });
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests(req: Request, res: Response): Promise<void> {
    try {
      const { testData } = req.body;
      
      if (!testData || !Array.isArray(testData)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test data'
        });
        return;
      }

      const results = await testingService.runUnitTests();
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          passed,
          failed,
          successRate: results.length > 0 ? (passed / results.length * 100).toFixed(1) + '%' : '0%'
        }
      });
    } catch (error: any) {
      console.error('Error running unit tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run unit tests',
          details: error.message
      });
    }
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests(req: Request, res: Response): Promise<void> {
    try {
      const { testData } = req.body;
      
      if (!testData || !Array.isArray(testData)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test data'
        });
        return;
      }

      const results = await testingService.runIntegrationTests();
      const passed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          passed,
          failed,
          successRate: results.length > 0 ? (passed / results.length * 100).toFixed(1) + '%' : '0%'
        }
      });
    } catch (error: any) {
      console.error('Error running integration tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run integration tests',
          details: error.message
      });
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(req: Request, res: Response): Promise<void> {
    try {
      const { testData } = req.body;
      
      if (!testData || !Array.isArray(testData)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test data'
        });
        return;
      }

      const configs: PerformanceTestConfig[] = req.body?.configs ?? [
        { query: 'SELECT COUNT(*) FROM test_data_repositories', iterations: 50, concurrentUsers: 5, expectedMaxTime: 200 },
        { query: 'SELECT * FROM test_data_repositories WHERE quality_score > 80', iterations: 20, concurrentUsers: 3, expectedMaxTime: 300 }
      ];
      const results = await testingService.runPerformanceTests(configs);
      const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / (results.length || 1);
      const slowQueries = results.filter(r => r.executionTime > 1000).length;
      
      res.json({
        success: true,
        results,
        summary: {
          totalQueries: results.length,
          averageExecutionTime: Math.round(avgExecutionTime),
          slowQueries,
          fastestQuery: Math.min(...results.map(r => r.executionTime)),
          slowestQuery: Math.max(...results.map(r => r.executionTime))
        }
      });
    } catch (error: any) {
      console.error('Error running performance tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run performance tests',
          details: error.message
      });
    }
  }

  /**
   * Run load tests
   */
  async runLoadTests(req: Request, res: Response): Promise<void> {
    try {
      const { configs = [] } = req.body;

      const loadConfigs: LoadTestConfig[] = (configs.length ? configs : [
        { tableName: 'load_test_table', initialRecordCount: 500, batchSize: 50, concurrentConnections: 5, duration: 15 }
      ]);
      const results = await testingService.runLoadTests(loadConfigs);
      const passed = results.filter(r => r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.executionTime, 0) / (results.length || 1);
      
      res.json({
        success: true,
        results,
        summary: {
          totalConnections: results.length,
          successfulConnections: passed,
          failedConnections: results.length - passed,
          averageResponseTime: Math.round(avgResponseTime),
          maxResponseTime: Math.max(...results.map(r => r.executionTime)),
          minResponseTime: Math.min(...results.map(r => r.executionTime))
        }
      });
    } catch (error: any) {
      console.error('Error running load tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run load tests',
          details: error.message
      });
    }
  }

  /**
   * Run security tests
   */
  async runSecurityTests(req: Request, res: Response): Promise<void> {
    try {
      const { testData } = req.body;
      
      if (!testData || !Array.isArray(testData)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test data'
        });
        return;
      }

      const results = await testingService.runSecurityTests();
      const injectionTests = results.filter(r => r.testName === 'SQL Injection Prevention');
      const blockedInjections = injectionTests.filter(r => r.success).length;
      
      res.json({
        success: true,
        results,
        summary: {
          totalTests: results.length,
          injectionAttempts: injectionTests.length,
          blockedInjections,
          dataValidationTests: results.filter(r => r.testName?.toLowerCase().includes('validation')).length,
          encryptionTests: results.filter(r => r.testName?.toLowerCase().includes('encryption')).length
        }
      });
    } catch (error: any) {
      console.error('Error running security tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run security tests',
          details: error.message
      });
    }
  }

  /**
   * Run data integrity tests
   */
  async runDataIntegrityTests(_req: Request, res: Response): Promise<void> {
    try {
      const results = await testingService.runDataIntegrityTests();
      
      res.json({
        success: true,
        results,
        summary: {
          totalTests: results.length,
          foreignKeyTests: results.filter(r => r.testName?.toLowerCase().includes('foreign key')).length,
          uniqueConstraintTests: results.filter(r => r.testName?.toLowerCase().includes('unique')).length,
          dataTypeTests: results.filter(r => r.testName?.toLowerCase().includes('data type')).length,
          checkConstraintTests: results.filter(r => r.testName?.toLowerCase().includes('check')).length
        }
      });
    } catch (error: any) {
      console.error('Error running data integrity tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run data integrity tests',
          details: error.message
      });
    }
  }

  /**
   * Run comprehensive test suite
   */
  async runComprehensiveTestSuite(req: Request, res: Response): Promise<void> {
    try {
      const { testData } = req.body;
      
      if (!testData || !Array.isArray(testData)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test data'
        });
        return;
      }

      const suite = await testingService.runComprehensiveTestSuite();
      const results = suite.results;
      const passed = results.filter(r => r.success).length;
      
      // Group results by test type
      const testTypeSummary: Record<string, { total: number; passed: number }> = {};
      results.forEach(result => {
        const key = (result as any).testType as string;
        if (!testTypeSummary[key]) {
          testTypeSummary[key] = { total: 0, passed: 0 };
        }
        testTypeSummary[key].total++;
        if ((result as any).success) testTypeSummary[key].passed++;
      });
      
      res.json({
        success: true,
        results,
        summary: {
          totalTests: results.length,
          passed,
          failed: results.length - passed,
          successRate: results.length > 0 ? (passed / results.length * 100).toFixed(1) + '%' : '0%',
          testTypes: testTypeSummary
        }
      });
    } catch (error: any) {
      console.error('Error running comprehensive test suite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run comprehensive test suite',
          details: error.message
      });
    }
  }

  /**
   * Run custom test
   */
  async runCustomTest(req: Request, res: Response): Promise<void> {
    try {
      const { testType } = req.body;
      
      if (!testType) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing test type'
        });
        return;
      }

      let results;
      switch (testType) {
        case DatabaseTestType.UNIT:
          results = await testingService.runUnitTests();
          break;
        case DatabaseTestType.INTEGRATION:
          results = await testingService.runIntegrationTests();
          break;
        case DatabaseTestType.PERFORMANCE:
          results = await testingService.runPerformanceTests([
            { query: 'SELECT COUNT(*) FROM test_data_repositories', iterations: 50, concurrentUsers: 5, expectedMaxTime: 200 }
          ]);
          break;
        case DatabaseTestType.LOAD:
          results = await testingService.runLoadTests([
            { tableName: 'load_test_table', initialRecordCount: 500, batchSize: 50, concurrentConnections: 5, duration: 15 }
          ]);
          break;
        case DatabaseTestType.SECURITY:
          results = await testingService.runSecurityTests();
          break;
        case DatabaseTestType.DATA_INTEGRITY:
          results = await testingService.runDataIntegrityTests();
          break;
        default:
          results = await testingService.runUnitTests();
      }
      const passed = results.filter((r: any) => r.success).length;
      
      res.json({
        success: true,
        results,
        summary: {
          totalTests: results.length,
          passed,
          failed: results.length - passed,
          successRate: results.length > 0 ? (passed / results.length * 100).toFixed(1) + '%' : '0%'
        }
      });
    } catch (error: any) {
      console.error('Error running custom test:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run custom test',
          details: error.message
      });
    }
  }

  /**
   * Cleanup test data
   */
  async cleanupTestData(_req: Request, res: Response): Promise<void> {
    try {
      await testingService.cleanupTestData();
      
      res.json({
        success: true,
        message: 'Test data cleanup completed successfully'
      });
    } catch (error: any) {
      console.error('Error cleaning up test data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup test data',
        details: error.message
      });
    }
  }

  /**
   * Get test categories and types
   */
  async getTestCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = Object.values(TestDataCategory);
      const testTypes = Object.values(DatabaseTestType);
      
      res.json({
        success: true,
        data: {
          categories,
          testTypes,
          categoryDescriptions: {
            [TestDataCategory.USERS]: 'User authentication and profile data',
            [TestDataCategory.SCRIPTS]: 'Playwright test scripts and metadata',
            [TestDataCategory.REPOSITORIES]: 'Git repository information',
            [TestDataCategory.ANALYTICS]: 'Performance and execution analytics',
            [TestDataCategory.METRICS]: 'System and application metrics',
            [TestDataCategory.LOGS]: 'Application and error logs',
            [TestDataCategory.EDGE_CASES]: 'Boundary conditions and unusual scenarios'
          },
          testTypeDescriptions: {
            [DatabaseTestType.UNIT]: 'Individual database operations testing',
            [DatabaseTestType.INTEGRATION]: 'Cross-table operation testing',
            [DatabaseTestType.PERFORMANCE]: 'Query performance and optimization',
            [DatabaseTestType.LOAD]: 'Concurrent connection testing',
            [DatabaseTestType.SECURITY]: 'SQL injection and security testing',
            [DatabaseTestType.DATA_INTEGRITY]: 'Constraint and validation testing',
            [DatabaseTestType.SCALABILITY]: 'Large dataset handling',
            [DatabaseTestType.STRESS]: 'Resource limit testing',
            [DatabaseTestType.REGRESSION]: 'Historical data validation'
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting test categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get test categories',
        details: error.message
      });
    }
  }
}