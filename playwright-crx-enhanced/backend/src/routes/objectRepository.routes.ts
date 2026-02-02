/**
 * Object Repository Routes
 * API routes for the centralized element repository
 */

import { Router } from 'express';
import { objectRepositoryController } from '../controllers/objectRepository.controller';

const router = Router();

// ==================== Page Objects ====================

/**
 * @route   POST /api/object-repository/pages
 * @desc    Create a new page object
 * @access  Private
 */
router.post('/pages', (req, res, next) => {
  objectRepositoryController.createPageObject(req, res, next);
});

/**
 * @route   GET /api/object-repository/pages
 * @desc    List all page objects
 * @query   projectId (optional) - Filter by project
 * @access  Private
 */
router.get('/pages', (req, res, next) => {
  objectRepositoryController.listPageObjects(req, res, next);
});

/**
 * @route   GET /api/object-repository/pages/:id
 * @desc    Get page object by ID
 * @query   includeElements (optional) - Include elements in response
 * @access  Private
 */
router.get('/pages/:id', (req, res, next) => {
  objectRepositoryController.getPageObject(req, res, next);
});

/**
 * @route   PUT /api/object-repository/pages/:id
 * @desc    Update page object
 * @access  Private
 */
router.put('/pages/:id', (req, res, next) => {
  objectRepositoryController.updatePageObject(req, res, next);
});

/**
 * @route   DELETE /api/object-repository/pages/:id
 * @desc    Delete page object
 * @access  Private
 */
router.delete('/pages/:id', (req, res, next) => {
  objectRepositoryController.deletePageObject(req, res, next);
});

/**
 * @route   GET /api/object-repository/pages/:pageObjectId/elements
 * @desc    Get all elements for a page object
 * @access  Private
 */
router.get('/pages/:pageObjectId/elements', (req, res, next) => {
  objectRepositoryController.getElementsByPageObject(req, res, next);
});

// ==================== UI Elements ====================

/**
 * @route   POST /api/object-repository/elements
 * @desc    Create a new UI element with locators
 * @access  Private
 */
router.post('/elements', (req, res, next) => {
  objectRepositoryController.createElement(req, res, next);
});

/**
 * @route   GET /api/object-repository/elements/:id
 * @desc    Get element by ID
 * @access  Private
 */
router.get('/elements/:id', (req, res, next) => {
  objectRepositoryController.getElement(req, res, next);
});

/**
 * @route   POST /api/object-repository/elements/search
 * @desc    Search elements with criteria
 * @access  Private
 */
router.post('/elements/search', (req, res, next) => {
  objectRepositoryController.searchElements(req, res, next);
});

/**
 * @route   PUT /api/object-repository/elements/:id
 * @desc    Update element
 * @access  Private
 */
router.put('/elements/:id', (req, res, next) => {
  objectRepositoryController.updateElement(req, res, next);
});

/**
 * @route   POST /api/object-repository/elements/bulk-update
 * @desc    Bulk update multiple elements
 * @access  Private
 */
router.post('/elements/bulk-update', (req, res, next) => {
  objectRepositoryController.bulkUpdateElements(req, res, next);
});

/**
 * @route   DELETE /api/object-repository/elements/:id
 * @desc    Delete element
 * @access  Private
 */
router.delete('/elements/:id', (req, res, next) => {
  objectRepositoryController.deleteElement(req, res, next);
});

/**
 * @route   POST /api/object-repository/elements/:id/usage
 * @desc    Increment element usage count
 * @access  Private
 */
router.post('/elements/:id/usage', (req, res, next) => {
  objectRepositoryController.incrementElementUsage(req, res, next);
});

// ==================== Element Locators ====================

/**
 * @route   POST /api/object-repository/elements/:elementId/locators
 * @desc    Add a locator to an element
 * @access  Private
 */
router.post('/elements/:elementId/locators', (req, res, next) => {
  objectRepositoryController.addElementLocator(req, res, next);
});

/**
 * @route   PUT /api/object-repository/locators/:locatorId
 * @desc    Update a locator
 * @access  Private
 */
router.put('/locators/:locatorId', (req, res, next) => {
  objectRepositoryController.updateLocator(req, res, next);
});

// ==================== Healing History ====================

/**
 * @route   POST /api/object-repository/elements/:elementId/healing
 * @desc    Record a healing event
 * @access  Private
 */
router.post('/elements/:elementId/healing', (req, res, next) => {
  objectRepositoryController.recordHealing(req, res, next);
});

/**
 * @route   GET /api/object-repository/elements/:elementId/healing
 * @desc    Get healing history for an element
 * @access  Private
 */
router.get('/elements/:elementId/healing', (req, res, next) => {
  objectRepositoryController.getHealingHistory(req, res, next);
});

// ==================== Repository Settings ====================

/**
 * @route   GET /api/object-repository/settings
 * @desc    Get repository settings
 * @query   projectId (optional) - Filter by project
 * @access  Private
 */
router.get('/settings', (req, res, next) => {
  objectRepositoryController.getSettings(req, res, next);
});

/**
 * @route   POST /api/object-repository/settings
 * @desc    Create or update repository settings
 * @access  Private
 */
router.post('/settings', (req, res, next) => {
  objectRepositoryController.upsertSettings(req, res, next);
});

// ==================== Statistics ====================

/**
 * @route   GET /api/object-repository/statistics
 * @desc    Get repository statistics
 * @query   projectId (optional) - Filter by project
 * @access  Private
 */
router.get('/statistics', (req, res, next) => {
  objectRepositoryController.getStatistics(req, res, next);
});

export default router;
