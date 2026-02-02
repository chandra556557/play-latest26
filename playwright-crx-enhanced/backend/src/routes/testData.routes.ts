import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getTestSuites,
  createTestSuite,
  updateTestSuite,
  deleteTestSuite,
  getTestData,
  createTestData,
  updateTestData,
  deleteTestData,
  generateSecurityTestData,
  generateBoundaryTestData,
  generateEquivalenceTestData,
  generatePositiveTestData,
  generateNegativeTestData,
  generateFromScriptTestData
} from '../controllers/testData.controller';

const router = Router();

// All routes require authentication EXCEPT external API forwarding
router.use((req, res, next) => {
  // Skip auth for external API generation endpoints
  if (req.path.startsWith('/generate/')) {
    return next();
  }
  // Apply auth middleware for other routes
  return authMiddleware(req, res, next);
});

// Test Suite routes
router.get('/suites', getTestSuites);
router.post('/suites', createTestSuite);
router.put('/suites/:id', updateTestSuite);
router.delete('/suites/:id', deleteTestSuite);

// Test Data routes
router.get('/data', getTestData);
router.post('/data', createTestData);
router.put('/data/:id', updateTestData);
router.delete('/data/:id', deleteTestData);

// External API forwarding routes - Test Data Generation
router.post('/generate/security', generateSecurityTestData);
router.post('/generate/boundary', generateBoundaryTestData);
router.post('/generate/equivalence', generateEquivalenceTestData);
router.post('/generate/positive', generatePositiveTestData);
router.post('/generate/negative', generateNegativeTestData);
router.post('/generate/from-script', generateFromScriptTestData);

export default router;
