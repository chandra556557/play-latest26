/**
 * Visual Regression Routes
 * Routes for screenshot comparison and visual regression testing
 */

import { Router } from 'express';
import * as visualRegressionController from '../controllers/visual-regression.controller';

const router = Router();

// Screenshot comparison
router.post('/compare', visualRegressionController.compareScreenshots);

// Screenshot analysis
router.post('/analyze', visualRegressionController.analyzeScreenshot);

// Health check
router.get('/health', visualRegressionController.getHealth);

export default router;
