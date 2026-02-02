/**
 * Script Workflow Controller
 * Manages script workflow state transitions and pipeline orchestration
 */

import { Request, Response } from 'express';
import pool from '../db';
import { 
  WorkflowStatus, 
  isTransitionAllowed, 
  getAllowedActions,
  getRecommendedNextStates,
  getTransitionMetadata 
} from '../types/workflowStatus';

export class WorkflowController {
  /**
   * Get current workflow status and metadata for a script
   */
  async getWorkflowStatus(req: Request, res: Response): Promise<any> {
    try {
      const { scriptId } = req.params;
      const userId = (req as any).user?.userId;

      const scriptResult = await pool.query(
        `SELECT id, name, "workflowStatus", "updatedAt" 
         FROM "Script" 
         WHERE id = $1 AND "userId" = $2`,
        [scriptId, userId]
      );
      
      const script = scriptResult.rows[0];

      if (!script) {
        return res.status(404).json({ 
          success: false, 
          error: 'Script not found' 
        });
      }

      const status = script.workflowStatus as WorkflowStatus;
      const allowedActions = getAllowedActions(status);
      const recommendedNext = getRecommendedNextStates(status);

      res.json({
        success: true,
        data: {
          scriptId: script.id,
          scriptName: script.name,
          currentStatus: status,
          allowedActions,
          recommendedNextStates: recommendedNext,
          lastUpdated: script.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error fetching workflow status:', error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || 'Failed to fetch workflow status' 
      });
    }
  }

  /**
   * Transition script to a new workflow state
   */
  async transitionStatus(req: Request, res: Response): Promise<any> {
    try {
      const { scriptId } = req.params;
      const { targetStatus, action, comment } = req.body;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role || 'user';

      if (!targetStatus) {
        return res.status(400).json({ 
          success: false, 
          error: 'targetStatus is required' 
        });
      }

      // Fetch current script
      const scriptResult = await pool.query(
        `SELECT * FROM "Script" WHERE id = $1 AND "userId" = $2`,
        [scriptId, userId]
      );
      
      const script = scriptResult.rows[0];

      if (!script) {
        return res.status(404).json({ 
          success: false, 
          error: 'Script not found' 
        });
      }

      const currentStatus = script.workflowStatus as WorkflowStatus;

      // Validate transition
      if (!isTransitionAllowed(currentStatus, targetStatus, userRole)) {
        return res.status(403).json({
          success: false,
          error: `Transition from ${currentStatus} to ${targetStatus} is not allowed`,
          currentStatus,
          targetStatus
        });
      }

      // Get transition metadata
      const transitionMeta = getTransitionMetadata(currentStatus, targetStatus);

      // Update script status
      const updateResult = await pool.query(
        `UPDATE "Script" 
         SET "workflowStatus" = $1, "updatedAt" = NOW() 
         WHERE id = $2 
         RETURNING id, name, "workflowStatus", "updatedAt"`,
        [targetStatus, scriptId]
      );
      
      const updatedScript = updateResult.rows[0];

      res.json({
        success: true,
        data: {
          scriptId: updatedScript.id,
          scriptName: updatedScript.name,
          previousStatus: currentStatus,
          currentStatus: updatedScript.workflowStatus,
          transition: transitionMeta,
          action: action || transitionMeta?.action,
          comment,
          timestamp: updatedScript.updatedAt
        },
        message: `Script transitioned from ${currentStatus} to ${targetStatus}`
      });
    } catch (error: any) {
      console.error('Error transitioning workflow status:', error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || 'Failed to transition workflow status' 
      });
    }
  }

  /**
   * Batch update: Set workflow status for multiple scripts
   */
  async batchUpdateStatus(req: Request, res: Response): Promise<any> {
    try {
      const { scriptIds, targetStatus } = req.body;
      const userId = (req as any).user?.userId;

      if (!scriptIds || !Array.isArray(scriptIds) || scriptIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'scriptIds array is required' 
        });
      }

      if (!targetStatus) {
        return res.status(400).json({ 
          success: false, 
          error: 'targetStatus is required' 
        });
      }

      // Update all scripts
      const updateResult = await pool.query(
        `UPDATE "Script" 
         SET "workflowStatus" = $1, "updatedAt" = NOW() 
         WHERE id = ANY($2) AND "userId" = $3`,
        [targetStatus, scriptIds, userId]
      );
      
      const result = { count: updateResult.rowCount || 0 };

      res.json({
        success: true,
        data: {
          updatedCount: result.count,
          targetStatus
        },
        message: `Updated ${result.count} script(s) to ${targetStatus}`
      });
    } catch (error: any) {
      console.error('Error batch updating workflow status:', error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || 'Failed to batch update workflow status' 
      });
    }
  }

  /**
   * Get all scripts filtered by workflow status
   */
  async getScriptsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const userId = (req as any).user?.userId;

      const scriptsResult = await pool.query(
        `SELECT 
           s.id, 
           s.name, 
           s.description, 
           s.language, 
           s."workflowStatus", 
           s."createdAt", 
           s."updatedAt",
           u.name as "userName",
           u.email as "userEmail"
         FROM "Script" s
         LEFT JOIN "User" u ON s."userId" = u.id
         WHERE s."workflowStatus" = $1 AND s."userId" = $2
         ORDER BY s."updatedAt" DESC`,
        [status, userId]
      );
      
      const scripts = scriptsResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        language: row.language,
        workflowStatus: row.workflowStatus,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          name: row.userName,
          email: row.userEmail
        }
      }));

      res.json({
        success: true,
        data: scripts,
        count: scripts.length,
        status
      });
    } catch (error: any) {
      console.error('Error fetching scripts by status:', error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || 'Failed to fetch scripts by status' 
      });
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      const statsResult = await pool.query(
        `SELECT "workflowStatus", COUNT(id) as count 
         FROM "Script" 
         WHERE "userId" = $1 
         GROUP BY "workflowStatus"`,
        [userId]
      );

      const formattedStats = statsResult.rows.reduce((acc: any, item: any) => {
        acc[item.workflowStatus] = parseInt(item.count);
        return acc;
      }, {});

      // Ensure all statuses are present
      const allStatuses: WorkflowStatus[] = ['draft', 'ai_enhanced', 'testdata_ready', 'human_review', 'finalized', 'archived'];
      allStatuses.forEach(status => {
        if (!formattedStats[status]) {
          formattedStats[status] = 0;
        }
      });

      const total = Object.values(formattedStats).reduce((sum: number, count) => sum + (count as number), 0);

      res.json({
        success: true,
        data: {
          byStatus: formattedStats,
          total,
          readyForCI: formattedStats.finalized || 0,
          pendingReview: formattedStats.human_review || 0,
          inProgress: (formattedStats.draft || 0) + (formattedStats.ai_enhanced || 0) + (formattedStats.testdata_ready || 0)
        }
      });
    } catch (error: any) {
      console.error('Error fetching workflow stats:', error);
      res.status(500).json({ 
        success: false, 
        error: error?.message || 'Failed to fetch workflow stats' 
      });
    }
  }
}

export const workflowController = new WorkflowController();
