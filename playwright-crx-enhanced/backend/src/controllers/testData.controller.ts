import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import pool from '../db';
import { randomUUID } from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get all test suites for a user
 */
export const getTestSuites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { rows } = await pool.query(
      `SELECT * FROM "TestSuite" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test suites' });
  }
};

/**
 * Create a test suite
 */
export const createTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description } = req.body;

    if (!name) throw new AppError('Suite name is required', 400);

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestSuite" (id, name, description, "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())
       RETURNING *`,
      [id, name, description || null, userId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create test suite' });
    }
  }
};

/**
 * Update a test suite
 */
export const updateTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test suite not found', 404);

    const { rows } = await pool.query(
      `UPDATE "TestSuite"
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [id, name || null, description || null]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update test suite' });
    }
  }
};

/**
 * Delete a test suite
 */
export const deleteTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test suite not found', 404);

    await pool.query(`DELETE FROM "TestSuite" WHERE id = $1`, [id]);

    res.status(200).json({ success: true, message: 'Test suite deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete test suite' });
    }
  }
};

/**
 * Get all test data (optionally filtered by suite)
 */
export const getTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { suiteId, environment, type } = req.query;

    let query = `SELECT td.*, ts.name as "suiteName"
                 FROM "TestData" td
                 JOIN "TestSuite" ts ON ts.id = td."suiteId"
                 WHERE ts."userId" = $1`;
    const params: any[] = [userId];
    let paramCount = 1;

    if (suiteId) {
      paramCount++;
      query += ` AND td."suiteId" = $${paramCount}`;
      params.push(suiteId);
    }

    if (environment) {
      paramCount++;
      query += ` AND td.environment = $${paramCount}`;
      params.push(environment);
    }

    if (type) {
      paramCount++;
      query += ` AND td.type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY td."createdAt" DESC`;

    const { rows } = await pool.query(query, params);

    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test data' });
  }
};

/**
 * Create test data
 */
export const createTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { suiteId, name, environment, type, data } = req.body;

    if (!suiteId || !name || !data) {
      throw new AppError('suiteId, name, and data are required', 400);
    }

    // Verify suite belongs to user
    const suiteCheck = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [suiteId, userId]
    );

    if (!suiteCheck.rowCount) throw new AppError('Test suite not found', 404);

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestData" (id, "suiteId", name, environment, type, data, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, now(), now())
       RETURNING *`,
      [id, suiteId, name, environment || 'dev', type || 'user', JSON.stringify(data)]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create test data' });
    }
  }
};

/**
 * Update test data
 */
export const updateTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, environment, type, data } = req.body;

    // Verify ownership through suite
    const existing = await pool.query(
      `SELECT td.id FROM "TestData" td
       JOIN "TestSuite" ts ON ts.id = td."suiteId"
       WHERE td.id = $1 AND ts."userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test data not found', 404);

    const { rows } = await pool.query(
      `UPDATE "TestData"
       SET name = COALESCE($2, name),
           environment = COALESCE($3, environment),
           type = COALESCE($4, type),
           data = COALESCE($5, data),
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [id, name || null, environment || null, type || null, data ? JSON.stringify(data) : null]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update test data' });
    }
  }
};

/**
 * Delete test data
 */
export const deleteTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Verify ownership through suite
    const existing = await pool.query(
      `SELECT td.id FROM "TestData" td
       JOIN "TestSuite" ts ON ts.id = td."suiteId"
       WHERE td.id = $1 AND ts."userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test data not found', 404);

    await pool.query(`DELETE FROM "TestData" WHERE id = $1`, [id]);

    res.status(200).json({ success: true, message: 'Test data deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete test data' });
    }
  }
};

/**
 * Forward request to external API for test data generation
 * Reads token from .env file and forwards to external Genie API
 */
const forwardToExternalAPI = async (testDataType: string, req: Request, res: Response): Promise<void> => {
  try {
    const { script_code, template, count } = req.body;

    // Get external API URL and token from .env
    const apiUrlMap: Record<string, string | undefined> = {
      'security': process.env.EXTERNAL_SECURITY_API_URL,
      'boundary': process.env.EXTERNAL_BOUNDARY_API_URL,
      'equivalence': process.env.EXTERNAL_EQUIVALENCE_API_URL,
      'positive': process.env.EXTERNAL_POSITIVE_API_URL,
      'negative': process.env.EXTERNAL_NEGATIVE_API_URL
    };

    const externalApiUrl = apiUrlMap[testDataType];
    const externalToken = process.env.EXTERNAL_API_TOKEN;

    if (!externalApiUrl) {
      res.status(400).json({
        success: false,
        error: `External API URL for ${testDataType} not configured in .env file`
      });
      return;
    }

    if (!externalToken) {
      res.status(400).json({
        success: false,
        error: 'EXTERNAL_API_TOKEN not configured in .env file'
      });
      return;
    }

    console.log(`📤 Forwarding to external API: ${externalApiUrl}`);
    console.log(`🔑 Using token from .env`);
    console.log(`📝 Script length: ${script_code?.length || 0} characters`);
    console.log(`📋 Template:`, JSON.stringify(template));
    console.log(`🔢 Count: ${count}`);
    
    // Debug: Log first 200 chars of script to verify what's being sent
    if (script_code) {
      console.log(`📜 Script preview:`, script_code.substring(0, 200) + '...');
    } else {
      console.warn(`⚠️ WARNING: No script_code provided!`);
    }

    // Forward request to external API
    const response = await axios.post(externalApiUrl, {
      script_code,
      template,
      count
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${externalToken}`
      }
    });

    console.log(`✅ External API response received`);

    // Return external API response
    res.status(200).json({
      success: true,
      data: response.data,
      metadata: {
        external_endpoint: externalApiUrl,
        test_data_type: testDataType,
        source: 'external_api'
      }
    });
  } catch (error: any) {
    console.error(`❌ External API Error:`, error.message);
    if (error.response) {
      console.error(`👉 Status:`, error.response.status);
      console.error(`👉 Response:`, error.response.data);
    }

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
      metadata: {
        external_endpoint: error.config?.url,
        test_data_type: testDataType,
        source: 'external_api_error'
      }
    });
  }
};

// Generate test data - Security
export const generateSecurityTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('security', req, res);
};

// Generate test data - Boundary
export const generateBoundaryTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('boundary', req, res);
};

// Generate test data - Equivalence
export const generateEquivalenceTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('equivalence', req, res);
};

// Generate test data - Positive
export const generatePositiveTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('positive', req, res);
};

// Generate test data - Negative
export const generateNegativeTestData = async (req: Request, res: Response) => {
  await forwardToExternalAPI('negative', req, res);
};
