/**
 * Element Dependency Controller
 * REST API endpoints for element relationships and dependencies
 */

import { Request, Response, NextFunction } from 'express';
import { elementDependencyService } from '../services/elementDependency.service';
import { CreateDependencyDTO } from '../types/objectRepository.types';

export class ElementDependencyController {
  /**
   * @route   POST /api/object-repository/dependencies
   * @desc    Create a new dependency relationship
   * @access  Private
   */
  async createDependency(req: Request, res: Response, _next: NextFunction) {
    try {
      const data: CreateDependencyDTO = req.body;
      
      if (!data.parentElementId || !data.dependentElementId || !data.dependencyType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: parentElementId, dependentElementId, dependencyType'
        });
      }

      const dependency = await elementDependencyService.createDependency(data);
      
      return res.status(201).json({
        success: true,
        data: dependency,
        message: 'Dependency created successfully'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @route   GET /api/object-repository/dependencies/element/:elementId
   * @desc    Get dependency graph for an element
   * @access  Private
   */
  async getDependencyGraph(req: Request, res: Response, _next: NextFunction) {
    try {
      const { elementId } = req.params;
      
      const graph = await elementDependencyService.getDependenciesForElement(elementId);
      
      return res.json({
        success: true,
        data: graph
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @route   GET /api/object-repository/dependencies/impact/:elementId
   * @desc    Analyze impact of changing/deleting an element
   * @access  Private
   */
  async analyzeImpact(req: Request, res: Response, _next: NextFunction) {
    try {
      const { elementId } = req.params;
      
      const analysis = await elementDependencyService.analyzeImpact(elementId);
      
      return res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @route   PUT /api/object-repository/dependencies/:id
   * @desc    Update a dependency
   * @access  Private
   */
  async updateDependency(req: Request, res: Response, _next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const dependency = await elementDependencyService.updateDependency(id, updates);
      
      return res.json({
        success: true,
        data: dependency,
        message: 'Dependency updated successfully'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @route   DELETE /api/object-repository/dependencies/:id
   * @desc    Delete a dependency
   * @access  Private
   */
  async deleteDependency(req: Request, res: Response, _next: NextFunction) {
    try {
      const { id } = req.params;
      
      await elementDependencyService.deleteDependency(id);
      
      return res.json({
        success: true,
        message: 'Dependency deleted successfully'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const elementDependencyController = new ElementDependencyController();
