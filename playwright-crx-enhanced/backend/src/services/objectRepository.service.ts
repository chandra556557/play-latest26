/**
 * Object Repository Service
 * Handles all business logic for the centralized element repository
 */

import { Pool } from 'pg';
import pool from '../db';
import {
  PageObject,
  UIElement,
  ElementLocator,
  UIElementWithLocators,
  PageObjectWithElements,
  RepositorySettings,
  RepositoryStatistics,
  CreatePageObjectDTO,
  UpdatePageObjectDTO,
  CreateUIElementDTO,
  UpdateUIElementDTO,
  ElementSearchCriteria,
  HealingHistoryEntry,
  ElementUsage,
  BulkUpdateElementsDTO,
} from '../types/objectRepository.types';

export class ObjectRepositoryService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // ==================== Page Objects ====================

  /**
   * Create a new page object
   */
  async createPageObject(data: CreatePageObjectDTO): Promise<PageObject> {
    const query = `
      INSERT INTO page_objects (
        name, display_name, description, url, url_pattern,
        project_id, code_language, namespace
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.name,
      data.displayName,
      data.description || null,
      data.url,
      data.urlPattern || null,
      data.projectId || null,
      data.codeLanguage || 'typescript',
      data.namespace || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapPageObject(result.rows[0]);
  }

  /**
   * Get page object by ID
   */
  async getPageObject(id: string): Promise<PageObject | null> {
    const query = 'SELECT * FROM page_objects WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    return this.mapPageObject(result.rows[0]);
  }

  /**
   * Get page object with all elements
   */
  async getPageObjectWithElements(id: string): Promise<PageObjectWithElements | null> {
    const pageObject = await this.getPageObject(id);
    if (!pageObject) return null;

    const elements = await this.getElementsByPageObject(id);

    return {
      ...pageObject,
      elements,
    };
  }

  /**
   * List all page objects
   */
  async listPageObjects(projectId?: string): Promise<PageObject[]> {
    let query = 'SELECT * FROM page_objects';
    const params: any[] = [];

    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }

    query += ' ORDER BY name ASC';

    const result = await this.pool.query(query, params);
    return result.rows.map(this.mapPageObject);
  }

  /**
   * Update page object
   */
  async updatePageObject(id: string, data: UpdatePageObjectDTO): Promise<PageObject> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.displayName !== undefined) {
      fields.push(`display_name = $${paramIndex++}`);
      values.push(data.displayName);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.url !== undefined) {
      fields.push(`url = $${paramIndex++}`);
      values.push(data.url);
    }
    if (data.urlPattern !== undefined) {
      fields.push(`url_pattern = $${paramIndex++}`);
      values.push(data.urlPattern);
    }
    if (data.codeLanguage !== undefined) {
      fields.push(`code_language = $${paramIndex++}`);
      values.push(data.codeLanguage);
    }
    if (data.namespace !== undefined) {
      fields.push(`namespace = $${paramIndex++}`);
      values.push(data.namespace);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE page_objects
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Page object not found');
    }

    return this.mapPageObject(result.rows[0]);
  }

  /**
   * Delete page object
   */
  async deletePageObject(id: string): Promise<void> {
    const query = 'DELETE FROM page_objects WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  // ==================== UI Elements ====================

  /**
   * Create a new UI element with locators
   */
  async createElement(data: CreateUIElementDTO): Promise<UIElementWithLocators> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert element
      const elementQuery = `
        INSERT INTO ui_elements (
          name, display_name, description, page_object_id,
          category, tag_name, attributes, xpath, css_selector, url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const elementValues = [
        data.name,
        data.displayName,
        data.description || null,
        data.pageObjectId,
        data.category,
        data.tagName,
        JSON.stringify(data.attributes || {}),
        data.xpath || null,
        data.cssSelector || null,
        data.url || null,
      ];

      const elementResult = await client.query(elementQuery, elementValues);
      const element = this.mapUIElement(elementResult.rows[0]);

      // Insert locators
      const locators: ElementLocator[] = [];
      for (const locator of data.locators) {
        const locatorQuery = `
          INSERT INTO element_locators (
            element_id, type, value, confidence, is_primary
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        const locatorValues = [
          element.id,
          locator.type,
          locator.value,
          locator.confidence || 1.0,
          locator.isPrimary || false,
        ];

        const locatorResult = await client.query(locatorQuery, locatorValues);
        locators.push(this.mapElementLocator(locatorResult.rows[0]));
      }

      // Insert tags if provided
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await client.query(
            'INSERT INTO element_tags (element_id, tag) VALUES ($1, $2)',
            [element.id, tag]
          );
        }
      }

      await client.query('COMMIT');

      return {
        ...element,
        locators,
        primaryLocator: locators.find(l => l.isPrimary),
        tags: data.tags || [],
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get element by ID with locators
   */
  async getElement(id: string): Promise<UIElementWithLocators | null> {
    const element = await this.getElementBasic(id);
    if (!element) return null;

    const locators = await this.getElementLocators(id);
    const tags = await this.getElementTags(id);

    return {
      ...element,
      locators,
      primaryLocator: locators.find(l => l.isPrimary),
      tags,
    };
  }

  /**
   * Get basic element info
   */
  private async getElementBasic(id: string): Promise<UIElement | null> {
    const query = 'SELECT * FROM ui_elements WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    return this.mapUIElement(result.rows[0]);
  }

  /**
   * Get elements by page object
   */
  async getElementsByPageObject(pageObjectId: string): Promise<UIElementWithLocators[]> {
    const query = 'SELECT * FROM ui_elements WHERE page_object_id = $1 ORDER BY name ASC';
    const result = await this.pool.query(query, [pageObjectId]);

    const elements: UIElementWithLocators[] = [];
    for (const row of result.rows) {
      const element = this.mapUIElement(row);
      const locators = await this.getElementLocators(element.id);
      const tags = await this.getElementTags(element.id);

      elements.push({
        ...element,
        locators,
        primaryLocator: locators.find(l => l.isPrimary),
        tags,
      });
    }

    return elements;
  }

  /**
   * Search elements with criteria
   */
  async searchElements(criteria: ElementSearchCriteria): Promise<UIElementWithLocators[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (criteria.query) {
      conditions.push(`(name ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`);
      params.push(`%${criteria.query}%`);
      paramIndex++;
    }

    if (criteria.pageObjectId) {
      conditions.push(`page_object_id = $${paramIndex}`);
      params.push(criteria.pageObjectId);
      paramIndex++;
    }

    if (criteria.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(criteria.category);
      paramIndex++;
    }

    if (criteria.isHealthy !== undefined) {
      conditions.push(`is_healthy = $${paramIndex}`);
      params.push(criteria.isHealthy);
      paramIndex++;
    }

    if (criteria.projectId) {
      conditions.push(`page_object_id IN (SELECT id FROM page_objects WHERE project_id = $${paramIndex})`);
      params.push(criteria.projectId);
      paramIndex++;
    }

    let query = 'SELECT * FROM ui_elements';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY usage_count DESC, name ASC';

    const result = await this.pool.query(query, params);

    const elements: UIElementWithLocators[] = [];
    for (const row of result.rows) {
      const element = this.mapUIElement(row);
      const locators = await this.getElementLocators(element.id);
      const tags = await this.getElementTags(element.id);

      // Filter by tags if provided
      if (criteria.tags && criteria.tags.length > 0) {
        const hasAllTags = criteria.tags.every(tag => tags.includes(tag));
        if (!hasAllTags) continue;
      }

      // Filter by locator type if provided
      if (criteria.locatorType) {
        const hasLocatorType = locators.some(l => l.type === criteria.locatorType);
        if (!hasLocatorType) continue;
      }

      elements.push({
        ...element,
        locators,
        primaryLocator: locators.find(l => l.isPrimary),
        tags,
      });
    }

    return elements;
  }

  /**
   * Update element
   */
  async updateElement(id: string, data: UpdateUIElementDTO): Promise<UIElement> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.displayName !== undefined) {
      fields.push(`display_name = $${paramIndex++}`);
      values.push(data.displayName);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }
    if (data.tagName !== undefined) {
      fields.push(`tag_name = $${paramIndex++}`);
      values.push(data.tagName);
    }
    if (data.attributes !== undefined) {
      fields.push(`attributes = $${paramIndex++}`);
      values.push(JSON.stringify(data.attributes));
    }
    if (data.xpath !== undefined) {
      fields.push(`xpath = $${paramIndex++}`);
      values.push(data.xpath);
    }
    if (data.cssSelector !== undefined) {
      fields.push(`css_selector = $${paramIndex++}`);
      values.push(data.cssSelector);
    }
    if (data.isHealthy !== undefined) {
      fields.push(`is_healthy = $${paramIndex++}`);
      values.push(data.isHealthy);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE ui_elements
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Element not found');
    }

    return this.mapUIElement(result.rows[0]);
  }

  /**
   * Bulk update elements
   */
  async bulkUpdateElements(data: BulkUpdateElementsDTO): Promise<number> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      let updatedCount = 0;

      for (const elementId of data.elementIds) {
        try {
          await this.updateElement(elementId, data.updates);
          updatedCount++;
        } catch (error) {
          console.error(`Failed to update element ${elementId}:`, error);
        }
      }

      await client.query('COMMIT');
      return updatedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete element
   */
  async deleteElement(id: string): Promise<void> {
    const query = 'DELETE FROM ui_elements WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Increment element usage
   */
  async incrementElementUsage(id: string): Promise<void> {
    const query = `
      UPDATE ui_elements
      SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await this.pool.query(query, [id]);
  }

  // ==================== Element Locators ====================

  /**
   * Get element locators
   */
  private async getElementLocators(elementId: string): Promise<ElementLocator[]> {
    const query = `
      SELECT * FROM element_locators
      WHERE element_id = $1
      ORDER BY is_primary DESC, confidence DESC
    `;
    const result = await this.pool.query(query, [elementId]);
    return result.rows.map(this.mapElementLocator);
  }

  /**
   * Add locator to element
   */
  async addElementLocator(
    elementId: string,
    type: string,
    value: string,
    confidence?: number,
    isPrimary?: boolean
  ): Promise<ElementLocator> {
    const query = `
      INSERT INTO element_locators (element_id, type, value, confidence, is_primary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      elementId,
      type,
      value,
      confidence || 1.0,
      isPrimary || false,
    ]);
    return this.mapElementLocator(result.rows[0]);
  }

  /**
   * Update locator
   */
  async updateLocator(
    locatorId: string,
    updates: { value?: string; confidence?: number; isActive?: boolean; isPrimary?: boolean }
  ): Promise<ElementLocator> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.value !== undefined) {
      fields.push(`value = $${paramIndex++}`);
      values.push(updates.value);
    }
    if (updates.confidence !== undefined) {
      fields.push(`confidence = $${paramIndex++}`);
      values.push(updates.confidence);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.isPrimary !== undefined) {
      fields.push(`is_primary = $${paramIndex++}`);
      values.push(updates.isPrimary);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(locatorId);
    const query = `
      UPDATE element_locators
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Locator not found');
    }

    return this.mapElementLocator(result.rows[0]);
  }

  // ==================== Healing History ====================

  /**
   * Record healing event
   */
  async recordHealing(
    elementId: string,
    oldType: string,
    oldValue: string,
    newType: string,
    newValue: string,
    reason?: string,
    autoApplied?: boolean,
    confidence?: number
  ): Promise<HealingHistoryEntry> {
    const query = `
      INSERT INTO healing_history (
        element_id, old_locator_type, old_locator_value,
        new_locator_type, new_locator_value, reason, auto_applied, confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      elementId,
      oldType,
      oldValue,
      newType,
      newValue,
      reason || null,
      autoApplied || false,
      confidence || null,
    ]);
    return this.mapHealingHistory(result.rows[0]);
  }

  /**
   * Get healing history for element
   */
  async getHealingHistory(elementId: string): Promise<HealingHistoryEntry[]> {
    const query = `
      SELECT * FROM healing_history
      WHERE element_id = $1
      ORDER BY timestamp DESC
    `;
    const result = await this.pool.query(query, [elementId]);
    return result.rows.map(this.mapHealingHistory);
  }

  // ==================== Repository Settings ====================

  /**
   * Get repository settings
   */
  async getSettings(projectId?: string): Promise<RepositorySettings | null> {
    let query = 'SELECT * FROM repository_settings';
    const params: any[] = [];

    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    } else {
      query += ' WHERE project_id IS NULL';
    }

    const result = await this.pool.query(query, params);
    if (result.rows.length === 0) return null;

    return this.mapRepositorySettings(result.rows[0]);
  }

  /**
   * Create or update settings
   */
  async upsertSettings(projectId: string | null, settings: Partial<RepositorySettings>): Promise<RepositorySettings> {
    const query = `
      INSERT INTO repository_settings (
        project_id, preferred_locator_order, naming_convention,
        default_language, default_framework, auto_healing_enabled,
        auto_healing_threshold, versioning
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (project_id)
      DO UPDATE SET
        preferred_locator_order = EXCLUDED.preferred_locator_order,
        naming_convention = EXCLUDED.naming_convention,
        default_language = EXCLUDED.default_language,
        default_framework = EXCLUDED.default_framework,
        auto_healing_enabled = EXCLUDED.auto_healing_enabled,
        auto_healing_threshold = EXCLUDED.auto_healing_threshold,
        versioning = EXCLUDED.versioning
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      projectId,
      JSON.stringify(settings.preferredLocatorOrder || ['testId', 'id', 'css', 'xpath']),
      settings.namingConvention || 'camelCase',
      settings.defaultLanguage || 'typescript',
      settings.defaultFramework || 'playwright',
      settings.autoHealingEnabled !== undefined ? settings.autoHealingEnabled : true,
      settings.autoHealingThreshold || 0.8,
      settings.versioning !== undefined ? settings.versioning : false,
    ]);

    return this.mapRepositorySettings(result.rows[0]);
  }

  // ==================== Statistics ====================

  /**
   * Get repository statistics
   */
  async getStatistics(projectId?: string): Promise<RepositoryStatistics> {
    const stats: RepositoryStatistics = {
      totalPages: 0,
      totalElements: 0,
      healthyElements: 0,
      unhealthyElements: 0,
      mostUsedElements: [],
      recentlyUpdated: [],
      locatorTypeDistribution: {} as any,
      categoryDistribution: {} as any,
    };

    // Total pages
    let pageQuery = 'SELECT COUNT(*) as count FROM page_objects';
    const pageParams: any[] = [];
    if (projectId) {
      pageQuery += ' WHERE project_id = $1';
      pageParams.push(projectId);
    }
    const pageResult = await this.pool.query(pageQuery, pageParams);
    stats.totalPages = parseInt(pageResult.rows[0].count);

    // Total elements and health
    let elementQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_healthy = true THEN 1 ELSE 0 END) as healthy,
        SUM(CASE WHEN is_healthy = false THEN 1 ELSE 0 END) as unhealthy
      FROM ui_elements ue
    `;
    const elementParams: any[] = [];
    if (projectId) {
      elementQuery += ' JOIN page_objects po ON ue.page_object_id = po.id WHERE po.project_id = $1';
      elementParams.push(projectId);
    }
    const elementResult = await this.pool.query(elementQuery, elementParams);
    stats.totalElements = parseInt(elementResult.rows[0].total);
    stats.healthyElements = parseInt(elementResult.rows[0].healthy);
    stats.unhealthyElements = parseInt(elementResult.rows[0].unhealthy);

    // Most used elements
    let usedQuery = `
      SELECT ue.* FROM ui_elements ue
    `;
    if (projectId) {
      usedQuery += ' JOIN page_objects po ON ue.page_object_id = po.id WHERE po.project_id = $1';
    }
    usedQuery += ' ORDER BY usage_count DESC LIMIT 10';
    const usedResult = await this.pool.query(usedQuery, projectId ? [projectId] : []);
    stats.mostUsedElements = usedResult.rows.map(this.mapUIElement);

    // Recently updated
    let updatedQuery = `
      SELECT ue.* FROM ui_elements ue
    `;
    if (projectId) {
      updatedQuery += ' JOIN page_objects po ON ue.page_object_id = po.id WHERE po.project_id = $1';
    }
    updatedQuery += ' ORDER BY updated_at DESC LIMIT 10';
    const updatedResult = await this.pool.query(updatedQuery, projectId ? [projectId] : []);
    stats.recentlyUpdated = updatedResult.rows.map(this.mapUIElement);

    // Category distribution
    let categoryQuery = `
      SELECT category, COUNT(*) as count FROM ui_elements ue
    `;
    if (projectId) {
      categoryQuery += ' JOIN page_objects po ON ue.page_object_id = po.id WHERE po.project_id = $1';
    }
    categoryQuery += ' GROUP BY category';
    const categoryResult = await this.pool.query(categoryQuery, projectId ? [projectId] : []);
    categoryResult.rows.forEach(row => {
      stats.categoryDistribution[row.category] = parseInt(row.count);
    });

    // Locator type distribution
    let locatorQuery = `
      SELECT el.type, COUNT(*) as count FROM element_locators el
      JOIN ui_elements ue ON el.element_id = ue.id
    `;
    if (projectId) {
      locatorQuery += ' JOIN page_objects po ON ue.page_object_id = po.id WHERE po.project_id = $1';
    }
    locatorQuery += ' GROUP BY el.type';
    const locatorResult = await this.pool.query(locatorQuery, projectId ? [projectId] : []);
    locatorResult.rows.forEach(row => {
      stats.locatorTypeDistribution[row.type] = parseInt(row.count);
    });

    return stats;
  }

  // ==================== Helper Methods ====================

  /**
   * Get element tags
   */
  private async getElementTags(elementId: string): Promise<string[]> {
    const query = 'SELECT tag FROM element_tags WHERE element_id = $1';
    const result = await this.pool.query(query, [elementId]);
    return result.rows.map(row => row.tag);
  }

  /**
   * Map database row to PageObject
   */
  private mapPageObject(row: any): PageObject {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      url: row.url,
      urlPattern: row.url_pattern,
      projectId: row.project_id,
      codeLanguage: row.code_language,
      namespace: row.namespace,
      testCount: row.test_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database row to UIElement
   */
  private mapUIElement(row: any): UIElement {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      pageObjectId: row.page_object_id,
      category: row.category,
      tagName: row.tag_name,
      attributes: typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes,
      xpath: row.xpath,
      cssSelector: row.css_selector,
      url: row.url,
      screenshotPath: row.screenshot_path,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      usageCount: row.usage_count,
      isHealthy: row.is_healthy,
    };
  }

  /**
   * Map database row to ElementLocator
   */
  private mapElementLocator(row: any): ElementLocator {
    return {
      id: row.id,
      elementId: row.element_id,
      type: row.type,
      value: row.value,
      confidence: parseFloat(row.confidence),
      isActive: row.is_active,
      isPrimary: row.is_primary,
      lastValidated: row.last_validated ? new Date(row.last_validated) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database row to HealingHistoryEntry
   */
  private mapHealingHistory(row: any): HealingHistoryEntry {
    return {
      id: row.id,
      elementId: row.element_id,
      oldLocatorType: row.old_locator_type,
      oldLocatorValue: row.old_locator_value,
      newLocatorType: row.new_locator_type,
      newLocatorValue: row.new_locator_value,
      reason: row.reason,
      autoApplied: row.auto_applied,
      confidence: row.confidence ? parseFloat(row.confidence) : undefined,
      timestamp: new Date(row.timestamp),
    };
  }

  /**
   * Map database row to RepositorySettings
   */
  private mapRepositorySettings(row: any): RepositorySettings {
    return {
      id: row.id,
      projectId: row.project_id,
      preferredLocatorOrder: typeof row.preferred_locator_order === 'string' 
        ? JSON.parse(row.preferred_locator_order)
        : row.preferred_locator_order,
      namingConvention: row.naming_convention,
      defaultLanguage: row.default_language,
      defaultFramework: row.default_framework,
      autoHealingEnabled: row.auto_healing_enabled,
      autoHealingThreshold: parseFloat(row.auto_healing_threshold),
      versioning: row.versioning,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const objectRepositoryService = new ObjectRepositoryService();
