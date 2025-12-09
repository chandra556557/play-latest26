/**
 * Visual Regression Controller
 * Handles screenshot comparison and visual regression testing
 */

import { Request, Response } from 'express';
import sharp from 'sharp';

/**
 * POST /api/visual-regression/compare
 * Compare two screenshots for visual differences
 */
export const compareScreenshots = async (req: Request, res: Response) => {
  try {
    const { before_screenshot, after_screenshot, tolerance } = req.body;

    if (!before_screenshot || !after_screenshot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: before_screenshot and after_screenshot (base64 encoded)'
      });
    }

    // Decode base64 images
    const beforeBuffer = Buffer.from(before_screenshot, 'base64');
    const afterBuffer = Buffer.from(after_screenshot, 'base64');

    // Get image metadata
    const beforeMeta = await sharp(beforeBuffer).metadata();
    const afterMeta = await sharp(afterBuffer).metadata();

    console.log('📸 Comparing screenshots:', {
      before: { width: beforeMeta.width, height: beforeMeta.height, format: beforeMeta.format },
      after: { width: afterMeta.width, height: afterMeta.height, format: afterMeta.format }
    });

    // Check if dimensions match
    const dimensionsMatch = beforeMeta.width === afterMeta.width && 
                           beforeMeta.height === afterMeta.height;

    if (!dimensionsMatch) {
      return res.json({
        success: true,
        data: {
          verdict: 'FAIL',
          similarity: 0.0,
          changes: [
            {
              area: 'overall',
              type: 'size',
              description: `Image dimensions changed from ${beforeMeta.width}x${beforeMeta.height} to ${afterMeta.width}x${afterMeta.height}`,
              severity: 'high',
              before_value: `${beforeMeta.width}x${beforeMeta.height}`,
              after_value: `${afterMeta.width}x${afterMeta.height}`
            }
          ],
          similarity_metrics: {
            method: 'dimension_check',
            dimensions_match: false
          }
        }
      });
    }

    // Convert images to raw pixel data for comparison
    const beforeRaw = await sharp(beforeBuffer)
      .raw()
      .toBuffer();
    
    const afterRaw = await sharp(afterBuffer)
      .raw()
      .toBuffer();

    // Calculate pixel-by-pixel similarity
    const channels = beforeMeta.channels || 3; // RGBA=4, RGB=3
    const totalPixels = beforeRaw.length / channels;
    let matchingPixels = 0;
    const threshold = 10; // Allow slight color variations

    for (let i = 0; i < beforeRaw.length; i += channels) {
      const rDiff = Math.abs(beforeRaw[i] - afterRaw[i]);
      const gDiff = Math.abs(beforeRaw[i + 1] - afterRaw[i + 1]);
      const bDiff = Math.abs(beforeRaw[i + 2] - afterRaw[i + 2]);
      
      if (rDiff <= threshold && gDiff <= threshold && bDiff <= threshold) {
        matchingPixels++;
      }
    }

    const pixelSimilarity = matchingPixels / totalPixels;
    const pixelDifferencePercent = ((1 - pixelSimilarity) * 100).toFixed(2);

    // Calculate file size similarity
    const beforeSize = beforeBuffer.length;
    const afterSize = afterBuffer.length;
    const sizeDifference = Math.abs(beforeSize - afterSize);
    const sizeChangePercent = ((sizeDifference / beforeSize) * 100).toFixed(2);

    // Overall similarity (weighted average)
    const overallSimilarity = pixelSimilarity;

    // Determine verdict based on tolerance
    const toleranceValue = tolerance || 0.95;
    const verdict = overallSimilarity >= toleranceValue ? 'PASS' : 'FAIL';

    // Detect changes
    const changes: any[] = [];

    if (parseFloat(sizeChangePercent) > 5) {
      changes.push({
        area: 'overall',
        type: 'size',
        description: `File size changed by ${sizeChangePercent}%`,
        severity: parseFloat(sizeChangePercent) > 15 ? 'high' : 'medium',
        before_value: `${beforeSize} bytes`,
        after_value: `${afterSize} bytes`
      });
    }

    if (parseFloat(pixelDifferencePercent) > 5) {
      changes.push({
        area: 'pixels',
        type: 'content',
        description: `Pixel difference of ${pixelDifferencePercent}%`,
        severity: parseFloat(pixelDifferencePercent) > 10 ? 'high' : 'medium',
        before_value: 'baseline',
        after_value: 'current'
      });
    }

    // Build response
    const result = {
      verdict,
      similarity: parseFloat(overallSimilarity.toFixed(4)),
      changes,
      similarity_metrics: {
        method: 'pixel_comparison',
        pixel_similarity: parseFloat(pixelSimilarity.toFixed(4)),
        pixel_difference_percent: parseFloat(pixelDifferencePercent),
        dimensions_match: dimensionsMatch,
        before_dimensions: `${beforeMeta.width}x${beforeMeta.height}`,
        after_dimensions: `${afterMeta.width}x${afterMeta.height}`
      },
      playwright_insights: {
        test_stability: verdict === 'PASS' ? 'high' : 'low',
        suggested_tolerance: toleranceValue,
        recommended_action: verdict === 'PASS' 
          ? 'Continue monitoring' 
          : 'Review visual changes and update baseline if intentional'
      },
      suggested_playwright_code: {
        assertion: `await expect(page).toHaveScreenshot('baseline.png', { maxDiffPixels: ${Math.ceil(totalPixels * (1 - toleranceValue))} });`,
        options: `{ threshold: ${(1 - toleranceValue).toFixed(2)}, maxDiffPixels: ${Math.ceil(totalPixels * (1 - toleranceValue))} }`
      }
    };

    console.log(`✅ Comparison complete: ${verdict} (${(overallSimilarity * 100).toFixed(2)}% similar)`);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Visual regression error:', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};

/**
 * POST /api/visual-regression/analyze
 * Analyze screenshot metadata without comparison
 */
export const analyzeScreenshot = async (req: Request, res: Response) => {
  try {
    const { screenshot } = req.body;

    if (!screenshot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: screenshot (base64 encoded)'
      });
    }

    const buffer = Buffer.from(screenshot, 'base64');
    const metadata = await sharp(buffer).metadata();

    return res.json({
      success: true,
      data: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        size_bytes: buffer.length,
        has_alpha: metadata.hasAlpha,
        color_space: metadata.space
      }
    });

  } catch (error) {
    console.error('Screenshot analysis error:', error);
    return res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};

/**
 * GET /api/visual-regression/health
 * Health check for visual regression service
 */
export const getHealth = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'visual-regression',
      features: [
        'Screenshot comparison',
        'Pixel-by-pixel analysis',
        'Metadata extraction',
        'Playwright integration'
      ]
    }
  });
};
