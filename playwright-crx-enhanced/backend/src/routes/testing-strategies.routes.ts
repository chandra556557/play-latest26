/**
 * Testing Strategies Routes
 * Routes for security testing, boundary value analysis, and equivalence partitioning
 */

import { Router } from 'express';
import { testingStrategiesController } from '../controllers/testing-strategies.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/testing-strategies/security
 * @desc    Generate security test data (SQL injection, XSS, auth bypass, etc.)
 * @access  Private
 * @body    { count?: number, options?: object, useAI?: boolean }
 */
router.post('/security', (req, res) => testingStrategiesController.generateSecurityTests(req, res));

/**
 * @route   POST /api/testing-strategies/boundary
 * @desc    Generate boundary value analysis test data
 * @access  Private
 * @body    { count?: number, fieldName?: string, fieldType?: string, minValue?: number, maxValue?: number, options?: object, useAI?: boolean }
 */
router.post('/boundary', (req, res) => testingStrategiesController.generateBoundaryTests(req, res));

/**
 * @route   POST /api/testing-strategies/equivalence
 * @desc    Generate equivalence partitioning test data
 * @access  Private
 * @body    { count?: number, fieldName?: string, partitionType?: string, options?: object, useAI?: boolean }
 */
router.post('/equivalence', (req, res) => testingStrategiesController.generateEquivalenceTests(req, res));

/**
 * @route   POST /api/testing-strategies/analyze-security
 * @desc    Analyze script for security vulnerabilities using Python AI
 * @access  Private
 * @body    { scriptCode: string, scriptId?: string }
 */
router.post('/analyze-security', (req, res) => testingStrategiesController.analyzeScriptSecurity(req, res));

/**
 * @route   POST /api/testing-strategies/generate-comprehensive
 * @desc    Generate comprehensive test suite using Python AI
 * @access  Private
 * @body    { scriptCode?: string, scriptId?: string, includeSecurityTests?: boolean, includeBoundaryTests?: boolean, includeEquivalenceTests?: boolean, count?: number }
 */
router.post('/generate-comprehensive', (req, res) => testingStrategiesController.generateComprehensiveSuite(req, res));

export default router;
