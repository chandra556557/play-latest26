import express from 'express';
import { DatabaseTestingController } from '../controllers/database-testing.controller';

const router = express.Router();
const databaseTestingController = new DatabaseTestingController();

/**
 * Database Testing Routes
 * All routes are prefixed with /api/database-testing
 */

// Get test categories and types
router.get('/categories', (req, res) => databaseTestingController.getTestCategories(req, res));

// Generate test data
router.post('/generate-data', (req, res) => databaseTestingController.generateTestData(req, res));

// Run specific test types
router.post('/unit-tests', (req, res) => databaseTestingController.runUnitTests(req, res));
router.post('/integration-tests', (req, res) => databaseTestingController.runIntegrationTests(req, res));
router.post('/performance-tests', (req, res) => databaseTestingController.runPerformanceTests(req, res));
router.post('/load-tests', (req, res) => databaseTestingController.runLoadTests(req, res));
router.post('/security-tests', (req, res) => databaseTestingController.runSecurityTests(req, res));
router.post('/data-integrity-tests', (req, res) => databaseTestingController.runDataIntegrityTests(req, res));

// Run comprehensive test suite
router.post('/comprehensive-suite', (req, res) => databaseTestingController.runComprehensiveTestSuite(req, res));

// Run custom tests
router.post('/custom-test', (req, res) => databaseTestingController.runCustomTest(req, res));

// Cleanup test data
router.delete('/cleanup', (req, res) => databaseTestingController.cleanupTestData(req, res));

export default router;