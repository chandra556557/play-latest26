/**
 * Script Analysis Service - Node.js Implementation
 * Analyzes Playwright scripts without Python dependency
 * Provides XPath analysis, quality scoring, and recommendations
 */

import axios from 'axios';

interface XPathAnalysis {
  xpath: string;
  line_number: number;
  type: string;
  stability_score: number;
  complexity_score: number;
  issues: string[];
  recommended_alternative: string;
  playwright_suggestion: string;
}

interface ScriptRecommendation {
  line_number: number;
  title: string;
  description: string;
  suggested_code: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface ScriptAnalysisResult {
  success: boolean;
  data: {
    quality_score: number;
    test_pattern: string;
    xpath_analysis: XPathAnalysis[];
    recommendations: ScriptRecommendation[];
    locator_quality: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
      unstable: number;
    };
    metadata: {
      total_lines: number;
      analyzed_at: string;
      analysis_method: string;
    };
  };
}

export class ScriptAnalysisService {
  private externalApiUrl: string;
  private externalApiToken: string;

  constructor() {
    // Use external Genie API (already configured in .env)
    this.externalApiUrl = process.env.EXTERNAL_XPATH_DEEP_ANALYSIS_URL?.replace('/xpath-deep-analysis', '') || 
                          'http://34.46.36.105:3000/genieapi/ai-analysis';
    this.externalApiToken = process.env.EXTERNAL_API_TOKEN || '';
  }

  /**
   * Analyze Playwright script using external API + local analysis
   */
  async analyzeScript(scriptCode: string, generateRecommendations: boolean = true): Promise<ScriptAnalysisResult> {
    try {
      console.log('🔍 Starting Node.js script analysis...');

      // 1. Extract XPaths from script
      const xpaths = this.extractXPaths(scriptCode);
      console.log(`📍 Found ${xpaths.length} XPath expressions`);

      // 2. Analyze each XPath using external API
      const xpathAnalyses = await this.analyzeXPaths(xpaths);

      // 3. Calculate quality score
      const qualityScore = this.calculateQualityScore(scriptCode, xpathAnalyses);

      // 4. Detect test pattern
      const testPattern = this.detectTestPattern(scriptCode);

      // 5. Generate recommendations
      const recommendations = generateRecommendations 
        ? this.generateRecommendations(scriptCode, xpathAnalyses)
        : [];

      // 6. Analyze locator quality
      const locatorQuality = this.analyzeLocatorQuality(scriptCode);

      return {
        success: true,
        data: {
          quality_score: qualityScore,
          test_pattern: testPattern,
          xpath_analysis: xpathAnalyses,
          recommendations,
          locator_quality: locatorQuality,
          metadata: {
            total_lines: scriptCode.split('\n').length,
            analyzed_at: new Date().toISOString(),
            analysis_method: 'nodejs-external-api'
          }
        }
      };
    } catch (error) {
      console.error('❌ Script analysis error:', error);
      
      // Fallback to basic analysis if external API fails
      return this.fallbackAnalysis(scriptCode);
    }
  }

  /**
   * Extract XPath expressions from script
   */
  private extractXPaths(scriptCode: string): Array<{ xpath: string; line_number: number }> {
    const xpaths: Array<{ xpath: string; line_number: number }> = [];
    const lines = scriptCode.split('\n');

    // XPath patterns
    const xpathPatterns = [
      /page\.locator\s*\(\s*['"](\/\/[^'"]+)['"]\s*\)/g,
      /page\.click\s*\(\s*['"](\/\/[^'"]+)['"]\s*\)/g,
      /page\.fill\s*\(\s*['"](\/\/[^'"]+)['"]/g,
      /page\.\$\s*\(\s*['"](\/\/[^'"]+)['"]\s*\)/g,
      /page\.\$\$\s*\(\s*['"](\/\/[^'"]+)['"]\s*\)/g,
    ];

    lines.forEach((line, index) => {
      xpathPatterns.forEach(pattern => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            xpaths.push({
              xpath: match[1],
              line_number: index
            });
          }
        }
      });
    });

    return xpaths;
  }

  /**
   * Analyze XPaths using external Genie API
   */
  private async analyzeXPaths(xpaths: Array<{ xpath: string; line_number: number }>): Promise<XPathAnalysis[]> {
    const analyses: XPathAnalysis[] = [];

    for (const { xpath, line_number } of xpaths) {
      try {
        // Call external Genie API for XPath deep analysis
        const response = await axios.post(
          `${this.externalApiUrl}/xpath-deep-analysis`,
          { xpath },
          {
            headers: {
              'Authorization': `Bearer ${this.externalApiToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data && response.data.data) {
          const data = response.data.data;
          analyses.push({
            xpath,
            line_number,
            type: data.type || this.detectXPathType(xpath),
            stability_score: data.stability_score || this.calculateStabilityScore(xpath),
            complexity_score: data.complexity_score || this.calculateComplexityScore(xpath),
            issues: data.issues || this.detectXPathIssues(xpath),
            recommended_alternative: data.recommended_alternative || this.suggestAlternative(xpath),
            playwright_suggestion: data.playwright_locator || this.convertToPlaywright(xpath)
          });
        } else {
          // Fallback to local analysis
          analyses.push(this.analyzeXPathLocally(xpath, line_number));
        }
      } catch (error) {
        console.warn(`⚠️  External API failed for XPath, using local analysis: ${xpath}`);
        // Fallback to local analysis
        analyses.push(this.analyzeXPathLocally(xpath, line_number));
      }
    }

    return analyses;
  }

  /**
   * Local XPath analysis (fallback)
   */
  private analyzeXPathLocally(xpath: string, line_number: number): XPathAnalysis {
    return {
      xpath,
      line_number,
      type: this.detectXPathType(xpath),
      stability_score: this.calculateStabilityScore(xpath),
      complexity_score: this.calculateComplexityScore(xpath),
      issues: this.detectXPathIssues(xpath),
      recommended_alternative: this.suggestAlternative(xpath),
      playwright_suggestion: this.convertToPlaywright(xpath)
    };
  }

  /**
   * Detect XPath type
   */
  private detectXPathType(xpath: string): string {
    if (xpath.includes('@id=')) return 'id-based';
    if (xpath.includes('@class=')) return 'class-based';
    if (xpath.includes('text()=') || xpath.includes('contains(text()')) return 'text-based';
    if (xpath.includes('@data-testid=')) return 'testid-based';
    if (xpath.includes('//') && !xpath.includes('[')) return 'absolute';
    return 'complex';
  }

  /**
   * Calculate stability score (0-100)
   */
  private calculateStabilityScore(xpath: string): number {
    let score = 100;

    // Penalties
    if (xpath.includes('//')) score -= 10; // Absolute paths are less stable
    if (xpath.match(/\[\d+\]/)) score -= 30; // Index-based selectors are fragile
    if (xpath.includes('@class=')) score -= 15; // Classes can change
    if (xpath.split('/').length > 5) score -= 20; // Deep paths are fragile
    if (!xpath.includes('@data-testid') && !xpath.includes('@id')) score -= 10;

    // Bonuses
    if (xpath.includes('@data-testid=')) score += 20;
    if (xpath.includes('@id=')) score += 15;
    if (xpath.includes('text()=')) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate complexity score (0-100)
   */
  private calculateComplexityScore(xpath: string): number {
    let score = 0;

    score += (xpath.split('/').length - 1) * 10; // Path depth
    score += (xpath.match(/\[/g) || []).length * 15; // Predicates
    score += (xpath.match(/and|or/g) || []).length * 10; // Logical operators
    score += xpath.length > 100 ? 20 : 0; // Length penalty

    return Math.min(100, score);
  }

  /**
   * Detect XPath issues
   */
  private detectXPathIssues(xpath: string): string[] {
    const issues: string[] = [];

    if (xpath.match(/\[\d+\]/)) issues.push('Index-based selector (fragile)');
    if (xpath.includes('@class=')) issues.push('Class-based selector (may change)');
    if (xpath.split('/').length > 5) issues.push('Deep nesting (maintenance issue)');
    if (xpath.includes('//') && !xpath.includes('@')) issues.push('Absolute path without attributes');
    if (xpath.length > 100) issues.push('Overly complex expression');

    return issues;
  }

  /**
   * Suggest Playwright alternative
   */
  private suggestAlternative(xpath: string): string {
    // ID-based
    if (xpath.match(/@id=['"]([^'"]+)['"]/)) {
      const id = xpath.match(/@id=['"]([^'"]+)['"]/)?.[1];
      return `Use CSS selector: #${id} or page.locator('#${id}')`;
    }

    // Text-based
    if (xpath.match(/text\(\)=['"]([^'"]+)['"]/)) {
      const text = xpath.match(/text\(\)=['"]([^'"]+)['"]/)?.[1];
      return `Use getByText: page.getByText('${text}')`;
    }

    // TestID
    if (xpath.match(/@data-testid=['"]([^'"]+)['"]/)) {
      const testId = xpath.match(/@data-testid=['"]([^'"]+)['"]/)?.[1];
      return `Use getByTestId: page.getByTestId('${testId}')`;
    }

    return 'Consider using Playwright semantic locators (getByRole, getByLabel, getByTestId)';
  }

  /**
   * Convert XPath to Playwright locator
   */
  private convertToPlaywright(xpath: string): string {
    // ID
    if (xpath.match(/@id=['"]([^'"]+)['"]/)) {
      const id = xpath.match(/@id=['"]([^'"]+)['"]/)?.[1];
      return `page.locator('#${id}')`;
    }

    // Text
    if (xpath.match(/text\(\)=['"]([^'"]+)['"]/)) {
      const text = xpath.match(/text\(\)=['"]([^'"]+)['"]/)?.[1];
      return `page.getByText('${text}')`;
    }

    // TestID
    if (xpath.match(/@data-testid=['"]([^'"]+)['"]/)) {
      const testId = xpath.match(/@data-testid=['"]([^'"]+)['"]/)?.[1];
      return `page.getByTestId('${testId}')`;
    }

    return `page.locator('${xpath}') // Consider semantic locator`;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(scriptCode: string, xpathAnalyses: XPathAnalysis[]): number {
    let score = 100;

    // XPath penalties
    if (xpathAnalyses.length > 0) {
      const avgStability = xpathAnalyses.reduce((sum, x) => sum + x.stability_score, 0) / xpathAnalyses.length;
      score = score * (avgStability / 100);
    }

    // Best practices
    if (!scriptCode.includes('getByRole')) score -= 5;
    if (!scriptCode.includes('getByTestId')) score -= 5;
    if (scriptCode.includes('waitForTimeout')) score -= 10;
    if (!scriptCode.includes('expect')) score -= 5;
    if (scriptCode.split('\n').length > 200) score -= 10; // Too long

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Detect test pattern
   */
  private detectTestPattern(scriptCode: string): string {
    const patterns: string[] = [];

    if (scriptCode.includes('class') && scriptCode.includes('constructor')) patterns.push('Page Object Model');
    if (scriptCode.includes('test.beforeEach') || scriptCode.includes('test.beforeAll')) patterns.push('Fixtures');
    if (scriptCode.includes('test.describe.parallel')) patterns.push('Parallel');
    if (scriptCode.includes('.json') || scriptCode.includes('.csv')) patterns.push('Data-Driven');
    if (scriptCode.includes('request.')) patterns.push('API Hybrid');

    return patterns.length > 0 ? patterns.join(', ') : 'Standard';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(scriptCode: string, xpathAnalyses: XPathAnalysis[]): ScriptRecommendation[] {
    const recommendations: ScriptRecommendation[] = [];

    // XPath recommendations
    xpathAnalyses.forEach(xpath => {
      if (xpath.stability_score < 60 || xpath.complexity_score > 70) {
        recommendations.push({
          line_number: xpath.line_number,
          title: `Improve XPath stability (${xpath.stability_score}/100)`,
          description: `Issues: ${xpath.issues.join(', ')}. ${xpath.recommended_alternative}`,
          suggested_code: xpath.playwright_suggestion,
          priority: xpath.stability_score < 40 ? 'high' : 'medium',
          category: 'selector'
        });
      }
    });

    // waitForTimeout
    if (scriptCode.includes('waitForTimeout')) {
      recommendations.push({
        line_number: 0,
        title: 'Replace waitForTimeout with waitForSelector',
        description: 'Hard waits are unreliable. Use explicit waits instead.',
        suggested_code: "await page.waitForSelector('selector', { state: 'visible' })",
        priority: 'high',
        category: 'wait'
      });
    }

    // Missing error handling
    if (!scriptCode.includes('try') && scriptCode.includes('await')) {
      recommendations.push({
        line_number: 0,
        title: 'Add error handling',
        description: 'Wrap async operations in try-catch blocks',
        suggested_code: 'try { ... } catch (error) { console.error(error); }',
        priority: 'medium',
        category: 'error-handling'
      });
    }

    return recommendations;
  }

  /**
   * Analyze locator quality distribution
   */
  private analyzeLocatorQuality(scriptCode: string): {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    unstable: number;
  } {
    let excellent = 0;
    let good = 0;
    let fair = 0;
    let poor = 0;
    let unstable = 0;

    // Count different locator types
    const getByRoleCount = (scriptCode.match(/getByRole/g) || []).length;
    const getByTestIdCount = (scriptCode.match(/getByTestId/g) || []).length;
    const getByLabelCount = (scriptCode.match(/getByLabel/g) || []).length;
    const cssCount = (scriptCode.match(/page\.locator\(['"][.#]/g) || []).length;
    const xpathCount = (scriptCode.match(/page\.locator\(['"]\/\//g) || []).length;

    excellent = getByRoleCount + getByTestIdCount;
    good = getByLabelCount;
    fair = cssCount;
    poor = xpathCount;
    unstable = (scriptCode.match(/\[\d+\]/g) || []).length;

    return { excellent, good, fair, poor, unstable };
  }

  /**
   * Fallback analysis when external API is unavailable
   */
  private fallbackAnalysis(scriptCode: string): ScriptAnalysisResult {
    console.log('⚠️ Using fallback analysis (external API unavailable)');

    const xpaths = this.extractXPaths(scriptCode);
    const xpathAnalyses = xpaths.map(({ xpath, line_number }) => 
      this.analyzeXPathLocally(xpath, line_number)
    );

    return {
      success: true,
      data: {
        quality_score: this.calculateQualityScore(scriptCode, xpathAnalyses),
        test_pattern: this.detectTestPattern(scriptCode),
        xpath_analysis: xpathAnalyses,
        recommendations: this.generateRecommendations(scriptCode, xpathAnalyses),
        locator_quality: this.analyzeLocatorQuality(scriptCode),
        metadata: {
          total_lines: scriptCode.split('\n').length,
          analyzed_at: new Date().toISOString(),
          analysis_method: 'nodejs-fallback'
        }
      }
    };
  }
}

// Export singleton instance
export const scriptAnalysisService = new ScriptAnalysisService();
