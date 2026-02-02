/**
 * Element Dependency Service
 * Handles element relationships, dependency mapping, and impact analysis
 */

import { Pool } from 'pg';
import pool from '../db';
import {
  ElementDependency,
  CreateDependencyDTO,
  DependencyGraph,
  ElementDependencyWithDetails,
  ImpactAnalysisResult,
  UIElement
} from '../types/objectRepository.types';

export class ElementDependencyService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // ==================== CRUD Operations ====================

  /**
   * Create a new dependency relationship
   * Validates for circular dependencies before creation
   */
  async createDependency(data: CreateDependencyDTO): Promise<ElementDependency> {
    // 1. Validate: No self-dependency
    if (data.parentElementId === data.dependentElementId) {
      throw new Error('Cannot create self-dependency: An element cannot depend on itself');
    }

    // 2. Check if dependency already exists
    const existingQuery = `
      SELECT id FROM element_dependencies
      WHERE parent_element_id = $1 
      AND dependent_element_id = $2 
      AND dependency_type = $3
    `;
    const existing = await this.pool.query(existingQuery, [
      data.parentElementId,
      data.dependentElementId,
      data.dependencyType
    ]);

    if (existing.rows.length > 0) {
      throw new Error('This dependency relationship already exists');
    }

    // 3. Check for circular dependencies
    const wouldCreateCircular = await this.wouldCreateCircularDependency(
      data.parentElementId,
      data.dependentElementId
    );

    if (wouldCreateCircular) {
      throw new Error(
        'Cannot create dependency: This would create a circular dependency chain'
      );
    }

    // 4. Create the dependency
    const query = `
      INSERT INTO element_dependencies (
        parent_element_id,
        dependent_element_id,
        dependency_type,
        description,
        is_mandatory
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.parentElementId,
      data.dependentElementId,
      data.dependencyType,
      data.description || null,
      data.isMandatory !== undefined ? data.isMandatory : true
    ];

    const result = await this.pool.query(query, values);
    return this.mapDependency(result.rows[0]);
  }

  /**
   * Get all dependencies for an element (both as parent and dependent)
   */
  async getDependenciesForElement(elementId: string): Promise<DependencyGraph> {
    // Get the element
    const elementQuery = 'SELECT * FROM ui_elements WHERE id = $1';
    const elementResult = await this.pool.query(elementQuery, [elementId]);
    
    if (elementResult.rows.length === 0) {
      throw new Error('Element not found');
    }

    const element = this.mapElement(elementResult.rows[0]);

    // Get dependencies (this element depends on others)
    const dependenciesQuery = `
      SELECT 
        d.*,
        pe.id as parent_id, pe.name as parent_name, pe.display_name as parent_display_name,
        pe.category as parent_category, pe.page_object_id as parent_page_id,
        de.id as dependent_id, de.name as dependent_name, de.display_name as dependent_display_name,
        de.category as dependent_category, de.page_object_id as dependent_page_id
      FROM element_dependencies d
      JOIN ui_elements pe ON d.parent_element_id = pe.id
      JOIN ui_elements de ON d.dependent_element_id = de.id
      WHERE d.dependent_element_id = $1
    `;

    // Get dependents (other elements depend on this)
    const dependentsQuery = `
      SELECT 
        d.*,
        pe.id as parent_id, pe.name as parent_name, pe.display_name as parent_display_name,
        pe.category as parent_category, pe.page_object_id as parent_page_id,
        de.id as dependent_id, de.name as dependent_name, de.display_name as dependent_display_name,
        de.category as dependent_category, de.page_object_id as dependent_page_id
      FROM element_dependencies d
      JOIN ui_elements pe ON d.parent_element_id = pe.id
      JOIN ui_elements de ON d.dependent_element_id = de.id
      WHERE d.parent_element_id = $1
    `;

    const [depsResult, deptsResult] = await Promise.all([
      this.pool.query(dependenciesQuery, [elementId]),
      this.pool.query(dependentsQuery, [elementId])
    ]);

    const dependencies = depsResult.rows.map(row => this.mapDependencyWithDetails(row));
    const dependents = deptsResult.rows.map(row => this.mapDependencyWithDetails(row));

    // Check for circular dependencies
    const hasCircular = await this.hasCircularDependency(elementId);

    // Get all impacted elements
    const impactedElements = await this.getAllImpactedElements(elementId);

    return {
      element,
      dependencies,
      dependents,
      hasCircularDependency: hasCircular,
      impactedElements
    };
  }

  /**
   * Delete a dependency
   */
  async deleteDependency(dependencyId: string): Promise<void> {
    const query = 'DELETE FROM element_dependencies WHERE id = $1';
    await this.pool.query(query, [dependencyId]);
  }

  /**
   * Update dependency
   */
  async updateDependency(
    dependencyId: string,
    updates: Partial<CreateDependencyDTO>
  ): Promise<ElementDependency> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.isMandatory !== undefined) {
      fields.push(`is_mandatory = $${paramCount++}`);
      values.push(updates.isMandatory);
    }

    if (updates.dependencyType) {
      fields.push(`dependency_type = $${paramCount++}`);
      values.push(updates.dependencyType);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(dependencyId);
    const query = `
      UPDATE element_dependencies
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return this.mapDependency(result.rows[0]);
  }

  // ==================== Impact Analysis ====================

  /**
   * Analyze the impact of changing/deleting an element
   */
  async analyzeImpact(elementId: string): Promise<ImpactAnalysisResult> {
    const elementQuery = 'SELECT name, display_name FROM ui_elements WHERE id = $1';
    const elementResult = await this.pool.query(elementQuery, [elementId]);
    
    if (elementResult.rows.length === 0) {
      throw new Error('Element not found');
    }

    const element = elementResult.rows[0];

    // Get all impacted elements (BFS traversal)
    const impactedElements = await this.getImpactedElementsWithDetails(elementId);

    // Get circular dependencies
    const circularDeps = await this.findCircularDependencies(elementId);

    // Get critical paths (mandatory dependency chains)
    const criticalPaths = await this.findCriticalPaths(elementId);

    // Count direct vs indirect
    const directDeps = impactedElements.filter(e => e.level === 1);
    const indirectDeps = impactedElements.filter(e => e.level > 1);

    return {
      targetElementId: elementId,
      targetElementName: element.name,
      directDependencies: directDeps.length,
      indirectDependencies: indirectDeps.length,
      totalImpactedElements: impactedElements.length,
      impactedElementsList: impactedElements,
      circularDependencies: circularDeps,
      criticalPaths
    };
  }

  // ==================== Circular Dependency Detection ====================

  /**
   * Check if creating a dependency would create a circular reference
   */
  private async wouldCreateCircularDependency(
    parentId: string,
    dependentId: string
  ): Promise<boolean> {
    // Check if dependent already has a path back to parent
    return this.hasPathBetween(dependentId, parentId);
  }

  /**
   * Check if element has any circular dependencies
   */
  private async hasCircularDependency(elementId: string): Promise<boolean> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    return this.detectCycleUtil(elementId, visited, recursionStack);
  }

  /**
   * DFS-based cycle detection
   */
  private async detectCycleUtil(
    elementId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): Promise<boolean> {
    visited.add(elementId);
    recursionStack.add(elementId);

    // Get all dependents (elements that depend on this element)
    const query = `
      SELECT dependent_element_id 
      FROM element_dependencies 
      WHERE parent_element_id = $1
    `;
    const result = await this.pool.query(query, [elementId]);

    for (const row of result.rows) {
      const dependentId = row.dependent_element_id;

      if (!visited.has(dependentId)) {
        if (await this.detectCycleUtil(dependentId, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dependentId)) {
        // Found a cycle
        return true;
      }
    }

    recursionStack.delete(elementId);
    return false;
  }

  /**
   * Check if there's a dependency path between two elements
   */
  private async hasPathBetween(fromId: string, toId: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue: string[] = [fromId];
    visited.add(fromId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === toId) {
        return true;
      }

      // Get all elements this one depends on (parents)
      const query = `
        SELECT parent_element_id 
        FROM element_dependencies 
        WHERE dependent_element_id = $1
      `;
      const result = await this.pool.query(query, [current]);

      for (const row of result.rows) {
        const parentId = row.parent_element_id;
        if (!visited.has(parentId)) {
          visited.add(parentId);
          queue.push(parentId);
        }
      }
    }

    return false;
  }

  /**
   * Find all circular dependency loops involving this element
   */
  private async findCircularDependencies(elementId: string): Promise<Array<{
    path: string[];
    description: string;
  }>> {
    const cycles: Array<{ path: string[]; description: string }> = [];
    const visited = new Set<string>();
    const path: string[] = [];

    await this.findCyclesUtil(elementId, elementId, visited, path, cycles);

    return cycles;
  }

  private async findCyclesUtil(
    startId: string,
    currentId: string,
    visited: Set<string>,
    path: string[],
    cycles: Array<{ path: string[]; description: string }>
  ): Promise<void> {
    path.push(currentId);
    visited.add(currentId);

    const query = `
      SELECT dependent_element_id, dependency_type 
      FROM element_dependencies 
      WHERE parent_element_id = $1
    `;
    const result = await this.pool.query(query, [currentId]);

    for (const row of result.rows) {
      const nextId = row.dependent_element_id;

      if (nextId === startId && path.length > 1) {
        // Found a cycle back to start
        cycles.push({
          path: [...path, nextId],
          description: `Circular dependency detected: ${path.join(' → ')} → ${nextId}`
        });
      } else if (!visited.has(nextId)) {
        await this.findCyclesUtil(startId, nextId, visited, path, cycles);
      }
    }

    path.pop();
    visited.delete(currentId);
  }

  // ==================== Impact Analysis Helpers ====================

  /**
   * Get all elements that would be impacted by changes to this element
   */
  private async getAllImpactedElements(elementId: string): Promise<string[]> {
    const impacted = new Set<string>();
    const queue: string[] = [elementId];

    while (queue.length > 0) {
      const current = queue.shift()!;

      const query = `
        SELECT dependent_element_id 
        FROM element_dependencies 
        WHERE parent_element_id = $1
      `;
      const result = await this.pool.query(query, [current]);

      for (const row of result.rows) {
        const depId = row.dependent_element_id;
        if (!impacted.has(depId)) {
          impacted.add(depId);
          queue.push(depId);
        }
      }
    }

    return Array.from(impacted);
  }

  /**
   * Get impacted elements with full details and depth level
   */
  private async getImpactedElementsWithDetails(elementId: string): Promise<Array<{
    id: string;
    name: string;
    displayName: string;
    level: number;
    relationshipType: string;
  }>> {
    const impacted: Map<string, { level: number; type: string }> = new Map();
    const queue: Array<{ id: string; level: number }> = [{ id: elementId, level: 0 }];

    while (queue.length > 0) {
      const { id: current, level } = queue.shift()!;

      const query = `
        SELECT d.dependent_element_id, d.dependency_type, e.name, e.display_name
        FROM element_dependencies d
        JOIN ui_elements e ON d.dependent_element_id = e.id
        WHERE d.parent_element_id = $1
      `;
      const result = await this.pool.query(query, [current]);

      for (const row of result.rows) {
        const depId = row.dependent_element_id;
        const newLevel = level + 1;

        if (!impacted.has(depId)) {
          impacted.set(depId, { level: newLevel, type: row.dependency_type });
          queue.push({ id: depId, level: newLevel });
        }
      }
    }

    // Convert to array with details
    const result: Array<{
      id: string;
      name: string;
      displayName: string;
      level: number;
      relationshipType: string;
    }> = [];

    for (const [id, { level, type }] of impacted.entries()) {
      const query = 'SELECT name, display_name FROM ui_elements WHERE id = $1';
      const elemResult = await this.pool.query(query, [id]);
      if (elemResult.rows.length > 0) {
        result.push({
          id,
          name: elemResult.rows[0].name,
          displayName: elemResult.rows[0].display_name,
          level,
          relationshipType: type
        });
      }
    }

    return result.sort((a, b) => a.level - b.level);
  }

  /**
   * Find all critical paths (mandatory dependency chains)
   */
  private async findCriticalPaths(elementId: string): Promise<Array<{
    path: string[];
    isMandatory: boolean;
  }>> {
    const paths: Array<{ path: string[]; isMandatory: boolean }> = [];
    await this.findPathsUtil(elementId, [], paths, new Set());
    return paths.filter(p => p.isMandatory);
  }

  private async findPathsUtil(
    currentId: string,
    currentPath: string[],
    allPaths: Array<{ path: string[]; isMandatory: boolean }>,
    visited: Set<string>
  ): Promise<void> {
    currentPath.push(currentId);
    visited.add(currentId);

    const query = `
      SELECT dependent_element_id, is_mandatory
      FROM element_dependencies
      WHERE parent_element_id = $1
    `;
    const result = await this.pool.query(query, [currentId]);

    if (result.rows.length === 0) {
      // Leaf node - save path
      allPaths.push({
        path: [...currentPath],
        isMandatory: true
      });
    } else {
      for (const row of result.rows) {
        const nextId = row.dependent_element_id;
        if (!visited.has(nextId)) {
          await this.findPathsUtil(nextId, [...currentPath], allPaths, new Set(visited));
        }
      }
    }
  }

  // ==================== Mapping Functions ====================

  private mapDependency(row: any): ElementDependency {
    return {
      id: row.id,
      parentElementId: row.parent_element_id,
      dependentElementId: row.dependent_element_id,
      dependencyType: row.dependency_type,
      description: row.description,
      isMandatory: row.is_mandatory,
      createdAt: row.created_at
    };
  }

  private mapDependencyWithDetails(row: any): ElementDependencyWithDetails {
    return {
      ...this.mapDependency(row),
      parentElement: {
        id: row.parent_id,
        name: row.parent_name,
        displayName: row.parent_display_name,
        category: row.parent_category,
        pageObjectId: row.parent_page_id
      } as UIElement,
      dependentElement: {
        id: row.dependent_id,
        name: row.dependent_name,
        displayName: row.dependent_display_name,
        category: row.dependent_category,
        pageObjectId: row.dependent_page_id
      } as UIElement
    };
  }

  private mapElement(row: any): UIElement {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      pageObjectId: row.page_object_id,
      category: row.category,
      tagName: row.tag_name,
      attributes: row.attributes || {},
      xpath: row.xpath,
      cssSelector: row.css_selector,
      url: row.url,
      screenshotPath: row.screenshot_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsedAt: row.last_used_at,
      usageCount: row.usage_count || 0,
      isHealthy: row.is_healthy !== false
    };
  }
}

export const elementDependencyService = new ElementDependencyService();
