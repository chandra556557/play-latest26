/**
 * Object Repository Controller
 * Handles HTTP requests for the Object Repository API
 */

import { Request, Response, NextFunction } from 'express';
import { objectRepositoryService } from '../services/objectRepository.service';
import {
  CreatePageObjectDTO,
  UpdatePageObjectDTO,
  CreateUIElementDTO,
  UpdateUIElementDTO,
  ElementSearchCriteria,
  BulkUpdateElementsDTO,
} from '../types/objectRepository.types';

export class ObjectRepositoryController {
  // ==================== Page Objects ====================

  /**
   * Create a new page object
   * POST /api/object-repository/pages
   */
  async createPageObject(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreatePageObjectDTO = req.body;
      
      // Validation
      if (!data.name || !data.displayName || !data.url) {
        return res.status(400).json({
          success: false,
          error: 'name, displayName, and url are required',
        });
      }

      const pageObject = await objectRepositoryService.createPageObject(data);

      res.status(201).json({
        success: true,
        data: pageObject,
        message: 'Page object created successfully',
      });
    } catch (error: any) {
      console.error('Error creating page object:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create page object',
      });
    }
  }

  /**
   * Get page object by ID
   * GET /api/object-repository/pages/:id
   */
  async getPageObject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { includeElements } = req.query;

      let pageObject;
      if (includeElements === 'true') {
        pageObject = await objectRepositoryService.getPageObjectWithElements(id);
      } else {
        pageObject = await objectRepositoryService.getPageObject(id);
      }

      if (!pageObject) {
        return res.status(404).json({
          success: false,
          error: 'Page object not found',
        });
      }

      res.json({
        success: true,
        data: pageObject,
      });
    } catch (error: any) {
      console.error('Error getting page object:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get page object',
      });
    }
  }

  /**
   * List page objects
   * GET /api/object-repository/pages
   */
  async listPageObjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;

      const pageObjects = await objectRepositoryService.listPageObjects(
        projectId as string | undefined
      );

      res.json({
        success: true,
        data: pageObjects,
        count: pageObjects.length,
      });
    } catch (error: any) {
      console.error('Error listing page objects:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list page objects',
      });
    }
  }

  /**
   * Update page object
   * PUT /api/object-repository/pages/:id
   */
  async updatePageObject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdatePageObjectDTO = req.body;

      const pageObject = await objectRepositoryService.updatePageObject(id, data);

      res.json({
        success: true,
        data: pageObject,
        message: 'Page object updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating page object:', error);
      const status = error.message === 'Page object not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update page object',
      });
    }
  }

  /**
   * Delete page object
   * DELETE /api/object-repository/pages/:id
   */
  async deletePageObject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await objectRepositoryService.deletePageObject(id);

      res.json({
        success: true,
        message: 'Page object deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting page object:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete page object',
      });
    }
  }

  // ==================== UI Elements ====================

  /**
   * Create a new UI element
   * POST /api/object-repository/elements
   */
  async createElement(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateUIElementDTO = req.body;

      // Validation
      if (!data.name || !data.displayName || !data.pageObjectId || !data.category || !data.tagName) {
        return res.status(400).json({
          success: false,
          error: 'name, displayName, pageObjectId, category, and tagName are required',
        });
      }

      if (!data.locators || data.locators.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one locator is required',
        });
      }

      const element = await objectRepositoryService.createElement(data);

      res.status(201).json({
        success: true,
        data: element,
        message: 'Element created successfully',
      });
    } catch (error: any) {
      console.error('Error creating element:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create element',
      });
    }
  }

  /**
   * Get element by ID
   * GET /api/object-repository/elements/:id
   */
  async getElement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const element = await objectRepositoryService.getElement(id);

      if (!element) {
        return res.status(404).json({
          success: false,
          error: 'Element not found',
        });
      }

      res.json({
        success: true,
        data: element,
      });
    } catch (error: any) {
      console.error('Error getting element:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get element',
      });
    }
  }

  /**
   * Get elements by page object
   * GET /api/object-repository/pages/:pageObjectId/elements
   */
  async getElementsByPageObject(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageObjectId } = req.params;

      const elements = await objectRepositoryService.getElementsByPageObject(pageObjectId);

      res.json({
        success: true,
        data: elements,
        count: elements.length,
      });
    } catch (error: any) {
      console.error('Error getting elements by page:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get elements',
      });
    }
  }

  /**
   * Search elements
   * POST /api/object-repository/elements/search
   */
  async searchElements(req: Request, res: Response, next: NextFunction) {
    try {
      const criteria: ElementSearchCriteria = req.body;

      const elements = await objectRepositoryService.searchElements(criteria);

      res.json({
        success: true,
        data: elements,
        count: elements.length,
      });
    } catch (error: any) {
      console.error('Error searching elements:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search elements',
      });
    }
  }

  /**
   * Update element
   * PUT /api/object-repository/elements/:id
   */
  async updateElement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateUIElementDTO = req.body;

      const element = await objectRepositoryService.updateElement(id, data);

      res.json({
        success: true,
        data: element,
        message: 'Element updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating element:', error);
      const status = error.message === 'Element not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update element',
      });
    }
  }

  /**
   * Bulk update elements
   * POST /api/object-repository/elements/bulk-update
   */
  async bulkUpdateElements(req: Request, res: Response, next: NextFunction) {
    try {
      const data: BulkUpdateElementsDTO = req.body;

      if (!data.elementIds || data.elementIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'elementIds array is required',
        });
      }

      const updatedCount = await objectRepositoryService.bulkUpdateElements(data);

      res.json({
        success: true,
        data: { updatedCount },
        message: `${updatedCount} elements updated successfully`,
      });
    } catch (error: any) {
      console.error('Error bulk updating elements:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to bulk update elements',
      });
    }
  }

  /**
   * Delete element
   * DELETE /api/object-repository/elements/:id
   */
  async deleteElement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await objectRepositoryService.deleteElement(id);

      res.json({
        success: true,
        message: 'Element deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting element:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete element',
      });
    }
  }

  /**
   * Increment element usage
   * POST /api/object-repository/elements/:id/usage
   */
  async incrementElementUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await objectRepositoryService.incrementElementUsage(id);

      res.json({
        success: true,
        message: 'Element usage incremented',
      });
    } catch (error: any) {
      console.error('Error incrementing element usage:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to increment element usage',
      });
    }
  }

  // ==================== Element Locators ====================

  /**
   * Add locator to element
   * POST /api/object-repository/elements/:elementId/locators
   */
  async addElementLocator(req: Request, res: Response, next: NextFunction) {
    try {
      const { elementId } = req.params;
      const { type, value, confidence, isPrimary } = req.body;

      if (!type || !value) {
        return res.status(400).json({
          success: false,
          error: 'type and value are required',
        });
      }

      const locator = await objectRepositoryService.addElementLocator(
        elementId,
        type,
        value,
        confidence,
        isPrimary
      );

      res.status(201).json({
        success: true,
        data: locator,
        message: 'Locator added successfully',
      });
    } catch (error: any) {
      console.error('Error adding locator:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add locator',
      });
    }
  }

  /**
   * Update locator
   * PUT /api/object-repository/locators/:locatorId
   */
  async updateLocator(req: Request, res: Response, next: NextFunction) {
    try {
      const { locatorId } = req.params;
      const updates = req.body;

      const locator = await objectRepositoryService.updateLocator(locatorId, updates);

      res.json({
        success: true,
        data: locator,
        message: 'Locator updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating locator:', error);
      const status = error.message === 'Locator not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update locator',
      });
    }
  }

  // ==================== Healing History ====================

  /**
   * Record healing event
   * POST /api/object-repository/elements/:elementId/healing
   */
  async recordHealing(req: Request, res: Response, next: NextFunction) {
    try {
      const { elementId } = req.params;
      const { oldType, oldValue, newType, newValue, reason, autoApplied, confidence } = req.body;

      if (!oldType || !oldValue || !newType || !newValue) {
        return res.status(400).json({
          success: false,
          error: 'oldType, oldValue, newType, and newValue are required',
        });
      }

      const healing = await objectRepositoryService.recordHealing(
        elementId,
        oldType,
        oldValue,
        newType,
        newValue,
        reason,
        autoApplied,
        confidence
      );

      res.status(201).json({
        success: true,
        data: healing,
        message: 'Healing event recorded',
      });
    } catch (error: any) {
      console.error('Error recording healing:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to record healing',
      });
    }
  }

  /**
   * Get healing history
   * GET /api/object-repository/elements/:elementId/healing
   */
  async getHealingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { elementId } = req.params;

      const history = await objectRepositoryService.getHealingHistory(elementId);

      res.json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error: any) {
      console.error('Error getting healing history:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get healing history',
      });
    }
  }

  // ==================== Repository Settings ====================

  /**
   * Get repository settings
   * GET /api/object-repository/settings
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;

      const settings = await objectRepositoryService.getSettings(projectId as string | undefined);

      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'Settings not found',
        });
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      console.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get settings',
      });
    }
  }

  /**
   * Create or update settings
   * POST /api/object-repository/settings
   */
  async upsertSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, ...settings } = req.body;

      const updatedSettings = await objectRepositoryService.upsertSettings(
        projectId || null,
        settings
      );

      res.json({
        success: true,
        data: updatedSettings,
        message: 'Settings saved successfully',
      });
    } catch (error: any) {
      console.error('Error upserting settings:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to save settings',
      });
    }
  }

  // ==================== Statistics ====================

  /**
   * Get repository statistics
   * GET /api/object-repository/statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;

      const statistics = await objectRepositoryService.getStatistics(projectId as string | undefined);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      console.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get statistics',
      });
    }
  }
}

export const objectRepositoryController = new ObjectRepositoryController();
