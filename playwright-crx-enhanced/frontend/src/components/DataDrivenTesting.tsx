import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Wand2,
  Download,
  Upload,
  Play,
  Copy,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Code,
  FileText,
  Database,
  Sparkles
} from 'lucide-react';
import './DataDrivenTesting.css';

const API_URL = 'http://localhost:3001/api';

interface Script {
  id: string;
  name: string;
  code: string;
  language: string;
}

interface ExtractedField {
  name: string;
  type: string;
  selector?: string;
  confidence: number;
}

interface GeneratedTestData {
  _testDataType: string;
  _index: number;
  [key: string]: any;
}

interface TestDataResponse {
  success: boolean;
  data: GeneratedTestData[];
  metadata: {
    count: number;
    testDataType: string;
    fieldsDetected: string[];
    generatedAt: string;
  };
}

const DataDrivenTesting = () => {
  // Script Selection
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loadingScripts, setLoadingScripts] = useState(false);

  // AI Field Extraction
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [extractingFields, setExtractingFields] = useState(false);
  const [showFields, setShowFields] = useState(true);

  // Test Data Generation
  const [testDataType, setTestDataType] = useState<'all' | 'boundary' | 'positive' | 'negative' | 'security' | 'equivalence'>('all');
  const [dataCount, setDataCount] = useState(10);
  const [generatedData, setGeneratedData] = useState<GeneratedTestData[]>([]);
  const [generatingData, setGeneratingData] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Custom Script Upload
  const [uploadedScript, setUploadedScript] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoadingScripts(true);
    try {
      const res = await axios.get(`${API_URL}/scripts`, { headers });
      const scriptList = res.data?.data || res.data?.scripts || [];
      setScripts(scriptList);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    } finally {
      setLoadingScripts(false);
    }
  };

  const extractFieldsWithAI = async (scriptCode: string) => {
    setExtractingFields(true);
    setExtractedFields([]);

    try {
      const response = await axios.post(
        `${API_URL}/ai-analysis/xpath-deep-analysis`,
        { scriptCode },
        { headers }
      );

      const fields: ExtractedField[] = response.data?.fields || [];
      setExtractedFields(fields);
      setShowFields(true);
    } catch (error: any) {
      console.error('Field extraction failed:', error);
      // Fallback to regex-based extraction
      const fallbackFields = extractFieldsManually(scriptCode);
      setExtractedFields(fallbackFields);
    } finally {
      setExtractingFields(false);
    }
  };

  const extractFieldsManually = (code: string): ExtractedField[] => {
    const fields: ExtractedField[] = [];
    const patterns = [
      /fill\(['"]#?([^'"`]+)['"]/, // ID selector
      /fill\(['"]\.([^'"`]+)['"]/, // Class selector
      /getByPlaceholder\(['"]([^'"`]+)['"]/, // Placeholder
      /getByLabel\(['"]([^'"`]+)['"]/, // Label
    ];

    patterns.forEach(pattern => {
      const matches = code.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        const fieldName = match[1];
        if (fieldName && !fields.find(f => f.name === fieldName)) {
          fields.push({
            name: fieldName,
            type: inferFieldType(fieldName),
            confidence: 0.6
          });
        }
      }
    });

    return fields;
  };

  const inferFieldType = (fieldName: string): string => {
    const name = fieldName.toLowerCase();
    if (name.includes('email') || name.includes('mail')) return 'email';
    if (name.includes('password') || name.includes('pwd')) return 'password';
    if (name.includes('phone') || name.includes('mobile')) return 'phone';
    if (name.includes('name') || name.includes('user')) return 'text';
    if (name.includes('amount') || name.includes('price') || name.includes('count')) return 'number';
    return 'text';
  };

  const generateTestData = async () => {
    if (!selectedScript && !uploadedScript) {
      alert('Please select a script or upload code first');
      return;
    }

    setGeneratingData(true);
    setGeneratedData([]);

    try {
      const scriptCode = selectedScript?.code || uploadedScript;

      // Determine which API endpoint to use based on data type
      const endpoints: Record<string, string> = {
        all: `${API_URL}/external-api/testdata/all`,
        boundary: `${API_URL}/external-api/testdata/boundary`,
        positive: `${API_URL}/external-api/testdata/positive`,
        negative: `${API_URL}/external-api/testdata/negative`,
        security: `${API_URL}/external-api/testdata/security`,
        equivalence: `${API_URL}/external-api/testdata/equivalence`
      };

      const endpoint = testDataType === 'all'
        ? endpoints.all
        : endpoints[testDataType];

      const response = await axios.post(
        endpoint,
        {
          scriptCode,
          count: dataCount,
          testDataType: testDataType === 'all' ? undefined : testDataType
        },
        { headers }
      );

      const result: TestDataResponse = response.data;
      setGeneratedData(result.data || []);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Test data generation failed:', error);
      alert(`Failed to generate test data: ${error.response?.data?.error || error.message}`);
    } finally {
      setGeneratingData(false);
    }
  };

  const downloadTestData = (format: 'json' | 'csv') => {
    if (generatedData.length === 0) {
      alert('No data to download');
      return;
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(generatedData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `test-data-${Date.now()}.json`);
      link.click();
    } else if (format === 'csv') {
      if (generatedData.length === 0) return;

      const headers = Object.keys(generatedData[0]);
      const csvContent = [
        headers.join(','),
        ...generatedData.map(row =>
          headers.map(header => {
            const value = row[header];
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            return `"${stringValue}"`;
          }).join(',')
        )
      ].join('\n');

      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `test-data-${Date.now()}.csv`);
      link.click();
    }
  };

  const generatePlaywrightCode = () => {
    if (generatedData.length === 0) {
      alert('No test data to generate code for');
      return;
    }

    const code = `import { test } from '@playwright/test';

// Data-driven test with ${generatedData.length} test cases
const testData = ${JSON.stringify(generatedData, null, 2)};

test.describe('Data-Driven Tests', () => {
  testData.forEach((data, index) => {
    test(\`Test case \${index + 1}: \${data._testDataType}\`, async ({ page }) => {
      // TODO: Add your test logic here
      console.log('Running test with data:', data);

      // Example: Fill form fields
      ${extractedFields.length > 0
        ? extractedFields.map(f => `      // await page.fill('#${f.name}', data.${f.name});`).join('\n')
        : '      // await page.fill(\'selector\', data.fieldName);'
      }
    });
  });
});`;

    navigator.clipboard.writeText(code);
    alert('Playwright code copied to clipboard!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const clearAll = () => {
    setSelectedScript(null);
    setUploadedScript('');
    setExtractedFields([]);
    setGeneratedData([]);
  };

  return (
    <div className="ddt-container">
      {/* Header */}
      <div className="ddt-header">
        <div className="ddt-title">
          <Database className="ddt-icon" />
          <div>
            <h1>Data-Driven Testing with AI</h1>
            <p>Automatically extract fields from scripts and generate intelligent test data</p>
          </div>
        </div>
        <div className="ddt-actions">
          <button onClick={clearAll} className="btn-secondary">
            <RefreshCw size={16} />
            Clear All
          </button>
        </div>
      </div>

      <div className="ddt-grid">
        {/* Left Panel - Script Selection & Field Extraction */}
        <div className="ddt-panel">
          <div className="ddt-panel-header">
            <h2><FileText size={18} /> 1. Select Script</h2>
            <p>Choose a script or upload custom code</p>
          </div>

          {/* Script Selection */}
          <div className="ddt-section">
            <label className="ddt-label">Select from Database</label>
            <select
              className="ddt-select"
              value={selectedScript?.id || ''}
              onChange={(e) => {
                const script = scripts.find(s => s.id === e.target.value);
                if (script) {
                  setSelectedScript(script);
                  setUploadedScript('');
                  extractFieldsWithAI(script.code);
                }
              }}
              disabled={loadingScripts}
            >
              <option value="">-- Select a script --</option>
              {scripts.map(script => (
                <option key={script.id} value={script.id}>
                  {script.name} ({script.language})
                </option>
              ))}
            </select>

            <div className="ddt-divider">
              <span>OR</span>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary w-full"
            >
              <Upload size={16} />
              Upload Custom Script
            </button>
          </div>

          {/* Extracted Fields */}
          {extractedFields.length > 0 && (
            <div className="ddt-section">
              <div
                className="ddt-collapsible-header"
                onClick={() => setShowFields(!showFields)}
              >
                <div className="ddt-collapsible-title">
                  <Sparkles size={16} />
                  <span>AI-Extracted Fields ({extractedFields.length})</span>
                </div>
                {showFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {showFields && (
                <div className="ddt-fields-list">
                  {extractedFields.map((field, idx) => (
                    <div key={idx} className="ddt-field-item">
                      <div className="ddt-field-info">
                        <span className="ddt-field-name">{field.name}</span>
                        <span className="ddt-field-type">{field.type}</span>
                        <span className="ddt-field-confidence">
                          {Math.round(field.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="ddt-modal-overlay" onClick={() => setShowUploadModal(false)}>
              <div className="ddt-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ddt-modal-header">
                  <h3>Upload Custom Script</h3>
                  <button onClick={() => setShowUploadModal(false)} className="ddt-close-btn">×</button>
                </div>
                <div className="ddt-modal-body">
                  <textarea
                    className="ddt-textarea"
                    placeholder="Paste your Playwright script code here..."
                    value={uploadedScript}
                    onChange={(e) => setUploadedScript(e.target.value)}
                    rows={15}
                  />
                  <div className="ddt-modal-actions">
                    <button
                      onClick={() => {
                        if (uploadedScript.trim()) {
                          setSelectedScript(null);
                          extractFieldsWithAI(uploadedScript);
                          setShowUploadModal(false);
                        }
                      }}
                      className="btn-primary"
                    >
                      <Wand2 size={16} />
                      Extract Fields & Analyze
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Test Data Generation */}
        <div className="ddt-panel">
          <div className="ddt-panel-header">
            <h2><Sparkles size={18} /> 2. Generate Test Data</h2>
            <p>Configure and generate AI-powered test data</p>
          </div>

          {/* Configuration */}
          <div className="ddt-section">
            <div className="ddt-form-group">
              <label className="ddt-label">Test Data Type</label>
              <select
                className="ddt-select"
                value={testDataType}
                onChange={(e) => setTestDataType(e.target.value as any)}
              >
                <option value="all">All Types (Comprehensive)</option>
                <option value="boundary">Boundary Value Analysis</option>
                <option value="positive">Positive Testing</option>
                <option value="negative">Negative Testing</option>
                <option value="security">Security Testing</option>
                <option value="equivalence">Equivalence Partitioning</option>
              </select>
            </div>

            <div className="ddt-form-group">
              <label className="ddt-label">Number of Records: {dataCount}</label>
              <input
                type="range"
                className="ddt-slider"
                min="1"
                max="50"
                value={dataCount}
                onChange={(e) => setDataCount(parseInt(e.target.value))}
              />
              <div className="ddt-slider-labels">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            <button
              onClick={generateTestData}
              disabled={generatingData || (!selectedScript && !uploadedScript)}
              className="btn-primary w-full"
            >
              {generatingData ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate Test Data
                </>
              )}
            </button>
          </div>

          {/* Generated Data Preview */}
          {generatedData.length > 0 && (
            <div className="ddt-section">
              <div
                className="ddt-collapsible-header"
                onClick={() => setShowPreview(!showPreview)}
              >
                <div className="ddt-collapsible-title">
                  <Eye size={16} />
                  <span>Generated Data ({generatedData.length} records)</span>
                </div>
                {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {showPreview && (
                <div className="ddt-data-preview">
                  <div className="ddt-data-actions">
                    <button onClick={() => downloadTestData('json')} className="btn-secondary btn-sm">
                      <Download size={14} />
                      JSON
                    </button>
                    <button onClick={() => downloadTestData('csv')} className="btn-secondary btn-sm">
                      <Download size={14} />
                      CSV
                    </button>
                    <button onClick={generatePlaywrightCode} className="btn-secondary btn-sm">
                      <Code size={14} />
                      Copy Playwright Code
                    </button>
                  </div>

                  <div className="ddt-data-table">
                    {generatedData.slice(0, 5).map((record, idx) => (
                      <div key={idx} className="ddt-data-record">
                        <div className="ddt-record-header">
                          <span className="ddt-record-index">#{record._index || idx + 1}</span>
                          <span className="ddt-record-type">{record._testDataType}</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(record, null, 2))}
                            className="ddt-icon-btn"
                            title="Copy record"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="ddt-record-fields">
                          {Object.entries(record)
                            .filter(([key]) => !key.startsWith('_'))
                            .map(([key, value]) => (
                              <div key={key} className="ddt-field-pair">
                                <span className="ddt-field-key">{key}:</span>
                                <span className="ddt-field-value">
                                  {typeof value === 'string' && value.length > 30
                                    ? value.substring(0, 30) + '...'
                                    : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                    {generatedData.length > 5 && (
                      <div className="ddt-more-records">
                        + {generatedData.length - 5} more records
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          {generatedData.length > 0 && (
            <div className="ddt-stats">
              <div className="ddt-stat-item">
                <span className="ddt-stat-label">Total Records</span>
                <span className="ddt-stat-value">{generatedData.length}</span>
              </div>
              <div className="ddt-stat-item">
                <span className="ddt-stat-label">Fields Detected</span>
                <span className="ddt-stat-value">
                  {generatedData[0] ? Object.keys(generatedData[0]).filter(k => !k.startsWith('_')).length : 0}
                </span>
              </div>
              <div className="ddt-stat-item">
                <span className="ddt-stat-label">Data Type</span>
                <span className="ddt-stat-value">{testDataType}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDrivenTesting;
