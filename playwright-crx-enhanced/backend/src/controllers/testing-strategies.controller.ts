/**
 * Testing Strategies Controller
 * Handles security testing, boundary value analysis, and equivalence partitioning
 */

import { Request, Response } from 'express';
import { TestDataService } from '../services/testdata.service';
import { logger } from '../utils/logger';
import axios from 'axios';

export class TestingStrategiesController {
  private testDataService: TestDataService;
  private pythonApiUrl: string;
  private pythonApiTimeout: number;

  constructor() {
    this.testDataService = new TestDataService();
    this.pythonApiUrl = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    this.pythonApiTimeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
  }

  /**
   * Generate Security Test Data via Python AI
   * @route POST /api/testing-strategies/security
   */
  async generateSecurityTests(req: Request, res: Response): Promise<any> {
    try {
      const { count = 10, options = {}, useAI = true } = req.body;

      if (useAI) {
        // Call Python AI service for advanced security test generation
        try {
          const response = await axios.post(
            `${this.pythonApiUrl}/assistant/generate-security-tests`,
            { count, options },
            {
              timeout: this.pythonApiTimeout,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.PYTHON_API_TOKEN ? `Bearer ${process.env.PYTHON_API_TOKEN}` : undefined
              }
            }
          );

          return res.json({
            success: true,
            message: 'AI-powered security test data generated successfully',
            data: response.data?.data || response.data,
            source: 'python-ai',
            metadata: {
              generatedCount: response.data?.data?.length || 0,
              aiEnhanced: true
            }
          });
        } catch (aiError) {
          logger.warn('Python AI service unavailable, falling back to local generation', { error: aiError });
        }
      }

      // Fallback to local generation
      const result = await this.testDataService.generateTestData({
        dataType: 'securityTest',
        count,
        options
      });

      res.json({
        success: true,
        message: 'Security test data generated successfully',
        data: result.data,
        source: 'local',
        metadata: {
          ...result.metadata,
          testTypes: ['sql_injection', 'xss_attack', 'auth_bypass', 'session_hijacking', 'csrf_attack', 'path_traversal', 'command_injection', 'xxe_attack', 'sensitive_data_exposure', 'broken_authentication'],
          owaspMapping: true
        }
      });
    } catch (error: any) {
      logger.error('Error generating security tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate security tests',
        message: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Generate Boundary Value Analysis Test Data via Python AI
   * @route POST /api/testing-strategies/boundary
   */
  async generateBoundaryTests(req: Request, res: Response): Promise<any> {
    try {
      const {
        count = 9,
        fieldName = 'value',
        fieldType = 'number',
        minValue = 0,
        maxValue = 100,
        options = {},
        useAI = true
      } = req.body;

      if (useAI) {
        try {
          const response = await axios.post(
            `${this.pythonApiUrl}/assistant/generate-boundary-tests`,
            { count, fieldName, fieldType, minValue, maxValue, options },
            {
              timeout: this.pythonApiTimeout,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.PYTHON_API_TOKEN ? `Bearer ${process.env.PYTHON_API_TOKEN}` : undefined
              }
            }
          );

          return res.json({
            success: true,
            message: 'AI-powered boundary value test data generated successfully',
            data: response.data?.data || response.data,
            source: 'python-ai',
            metadata: {
              generatedCount: response.data?.data?.length || 0,
              aiEnhanced: true,
              fieldName,
              fieldType,
              range: { min: minValue, max: maxValue }
            }
          });
        } catch (aiError) {
          logger.warn('Python AI service unavailable, falling back to local generation', { error: aiError });
        }
      }

      // Fallback to local generation
      const result = await this.testDataService.generateTestData({
        dataType: 'boundaryValue',
        count,
        options: {
          ...options,
          fieldName,
          fieldType,
          minValue,
          maxValue
        }
      });

      res.json({
        success: true,
        message: 'Boundary value test data generated successfully',
        data: result.data,
        source: 'local',
        metadata: {
          ...result.metadata,
          fieldName,
          fieldType,
          range: { min: minValue, max: maxValue },
          boundaryTypes: ['min', 'min-1', 'min+1', 'max', 'max+1', 'max-1', 'typical', 'zero', 'negative']
        }
      });
    } catch (error: any) {
      logger.error('Error generating boundary tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate boundary tests',
        message: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Generate Equivalence Partitioning Test Data via Python AI
   * @route POST /api/testing-strategies/equivalence
   */
  async generateEquivalenceTests(req: Request, res: Response): Promise<any> {
    try {
      const {
        count = 10,
        fieldName = 'transferAmount',
        partitionType = 'all',
        options = {},
        useAI = true
      } = req.body;

      if (useAI) {
        try {
          const response = await axios.post(
            `${this.pythonApiUrl}/assistant/generate-equivalence-tests`,
            { count, fieldName, partitionType, options },
            {
              timeout: this.pythonApiTimeout,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.PYTHON_API_TOKEN ? `Bearer ${process.env.PYTHON_API_TOKEN}` : undefined
              }
            }
          );

          return res.json({
            success: true,
            message: 'AI-powered equivalence partition test data generated successfully',
            data: response.data?.data || response.data,
            source: 'python-ai',
            metadata: {
              generatedCount: response.data?.data?.length || 0,
              aiEnhanced: true,
              fieldName,
              partitionType
            }
          });
        } catch (aiError) {
          logger.warn('Python AI service unavailable, falling back to local generation', { error: aiError });
        }
      }

      // Fallback to local generation
      const result = await this.testDataService.generateTestData({
        dataType: 'equivalencePartition',
        count,
        options: {
          ...options,
          fieldName,
          partitionType
        }
      });

      res.json({
        success: true,
        message: 'Equivalence partition test data generated successfully',
        data: result.data,
        source: 'local',
        metadata: {
          ...result.metadata,
          fieldName,
          partitionType,
          availableFields: ['transferAmount', 'accountType', 'customerAge', 'iban', 'currency']
        }
      });
    } catch (error: any) {
      logger.error('Error generating equivalence tests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate equivalence tests',
        message: error?.message || 'Unknown error'
      });
    }
  }

  /**
   * Analyze script for security vulnerabilities using Python AI
   * @route POST /api/testing-strategies/analyze-security
   */
  async analyzeScriptSecurity(req: Request, res: Response): Promise<any> {
    try {
      const { scriptCode, scriptId } = req.body;

      if (!scriptCode) {
        return res.status(400).json({
          success: false,
          error: 'Script code is required'
        });
      }

      const response = await axios.post(
        `${this.pythonApiUrl}/assistant/analyze-security`,
        { script: scriptCode, scriptId },
        {
          timeout: this.pythonApiTimeout,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.PYTHON_API_TOKEN ? `Bearer ${process.env.PYTHON_API_TOKEN}` : undefined
          }
        }
      );

      res.json({
        success: true,
        message: 'Security analysis completed',
        data: response.data,
        source: 'python-ai'
      });
    } catch (error: any) {
      logger.error('Error analyzing script security:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze script security',
        message: error?.message || 'Python AI service unavailable'
      });
    }
  }

  /**
   * Generate comprehensive test suite using Python AI
   * @route POST /api/testing-strategies/generate-comprehensive
   */
  async generateComprehensiveSuite(req: Request, res: Response): Promise<any> {
    try {
      const {
        scriptCode,
        scriptId,
        includeSecurityTests = true,
        includeBoundaryTests = true,
        includeEquivalenceTests = true,
        count = 5
      } = req.body;

      const response = await axios.post(
        `${this.pythonApiUrl}/assistant/generate-comprehensive-tests`,
        {
          script: scriptCode,
          scriptId,
          includeSecurityTests,
          includeBoundaryTests,
          includeEquivalenceTests,
          count
        },
        {
          timeout: this.pythonApiTimeout * 2, // Longer timeout for comprehensive generation
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.PYTHON_API_TOKEN ? `Bearer ${process.env.PYTHON_API_TOKEN}` : undefined
          }
        }
      );

      res.json({
        success: true,
        message: 'Comprehensive test suite generated successfully',
        data: response.data,
        source: 'python-ai'
      });
    } catch (error: any) {
      logger.error('Error generating comprehensive test suite:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate comprehensive test suite',
        message: error?.message || 'Python AI service unavailable'
      });
    }
  }
}

export const testingStrategiesController = new TestingStrategiesController();
