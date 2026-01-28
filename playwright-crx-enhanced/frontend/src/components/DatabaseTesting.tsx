import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

type CategoriesResponse = {
  categories: string[];
  testTypes: string[];
  categoryDescriptions: Record<string, string>;
  testTypeDescriptions: Record<string, string>;
};

type TestResult = {
  passed: boolean;
  testType: string;
  testName: string;
  message?: string;
  executionTime: number;
};

type TestSummary = {
  total: number;
  passed: number;
  failed: number;
  successRate: string | number;
};

const DatabaseTesting = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'test' | 'results'>('generate');
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [testDataCount, setTestDataCount] = useState<number>(10);
  const [testData, setTestData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [scriptCode, setScriptCode] = useState<string>('');
  const [posCount, setPosCount] = useState<number>(5);
  const [negCount, setNegCount] = useState<number>(5);
  const [bndCount, setBndCount] = useState<number>(5);
  const [eqvCount, setEqvCount] = useState<number>(5);
  const [secCount, setSecCount] = useState<number>(5);
  const [fieldHintsText, setFieldHintsText] = useState<string>('');
  const [localesText, setLocalesText] = useState<string>('');
  const [seedValue, setSeedValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/database-testing/categories`);
      if ((response as any).data.success) {
        setCategories((response as any).data.data as CategoriesResponse);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Failed to load test categories');
    }
  };

  const generateTestData = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/database-testing/generate-data`, {
        category: selectedCategory,
        count: testDataCount
      });
      
      if ((response as any).data.success) {
        setTestData((response as any).data.data as any[]);
        setTestResults([]);
        setTestSummary(null);
      }
    } catch (err: any) {
      console.error('Error generating test data:', err);
      setError(err?.response?.data?.error || 'Failed to generate test data');
    } finally {
      setLoading(false);
    }
  };

  const generateFromScript = async () => {
    if (!scriptCode || scriptCode.trim().length < 10) {
      setError('Please paste a valid Playwright script');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let fieldHints: any = undefined;
      let locales: any = undefined;
      try {
        fieldHints = fieldHintsText ? JSON.parse(fieldHintsText) : undefined;
      } catch (_e) {
        setError('Invalid field hints JSON');
        setLoading(false);
        return;
      }
      try {
        locales = localesText ? JSON.parse(localesText) : undefined;
      } catch (_e) {
        setError('Invalid locales JSON');
        setLoading(false);
        return;
      }

      const counts = {
        positive: posCount,
        negative: negCount,
        boundary: bndCount,
        equivalence: eqvCount,
        security: secCount
      };

      const response = await axios.post(`${API_URL}/testdata/generate/from-script`, {
        scriptCode,
        testTypes: ['positive', 'negative', 'boundary', 'equivalence', 'security'],
        counts,
        fieldHints,
        locales,
        seed: seedValue
      });

      const data = (response as any).data?.data;
      if (data) {
        const flattened: any[] = [];
        if (Array.isArray(data.positive)) flattened.push(...data.positive);
        if (Array.isArray(data.negative)) flattened.push(...data.negative);
        Object.values(data.boundary || {}).forEach((arr: any) => Array.isArray(arr) && flattened.push(...arr));
        Object.values(data.equivalence || {}).forEach((arr: any) => Array.isArray(arr) && flattened.push(...arr));
        Object.values(data.security || {}).forEach((arr: any) => Array.isArray(arr) && flattened.push(...arr));
        setTestData(flattened);
        setTestResults([]);
        setTestSummary(null);
      }
    } catch (err: any) {
      console.error('Error generating from script:', err);
      setError(err?.response?.data?.error || 'Failed to generate test data from script');
    } finally {
      setLoading(false);
    }
  };

  const runTests = async (testType: string) => {
    if (testData.length === 0) {
      setError('Please generate test data first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const endpoint = `${API_URL}/database-testing/${testType}`;
      const response = await axios.post(endpoint, { testData });
      
      if ((response as any).data.success) {
        setTestResults(((response as any).data.results || []) as TestResult[]);
        setTestSummary(((response as any).data.summary || null) as TestSummary);
      }
    } catch (err: any) {
      console.error('Error running tests:', err);
      setError(err?.response?.data?.error || 'Failed to run tests');
    } finally {
      setLoading(false);
    }
  };

  const runComprehensiveSuite = async () => {
    if (testData.length === 0) {
      setError('Please generate test data first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/database-testing/comprehensive-suite`, {
        testData
      });
      
      if ((response as any).data.success) {
        setTestResults(((response as any).data.results || []) as TestResult[]);
        setTestSummary(((response as any).data.summary || null) as TestSummary);
      }
    } catch (err: any) {
      console.error('Error running comprehensive suite:', err);
      setError(err?.response?.data?.error || 'Failed to run comprehensive test suite');
    } finally {
      setLoading(false);
    }
  };

  const cleanupTestData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.delete(`${API_URL}/database-testing/cleanup`);
      if ((response as any).data.success) {
        setTestData([]);
        setTestResults([]);
        setTestSummary(null);
      }
    } catch (err: any) {
      console.error('Error cleaning up test data:', err);
      setError(err?.response?.data?.error || 'Failed to cleanup test data');
    } finally {
      setLoading(false);
    }
  };

  if (!categories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="database-testing-container bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Database Testing</h1>
        <p className="text-gray-600">Comprehensive database testing with realistic test data generation</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'generate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Generate Test Data
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'test'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Run Tests
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'results'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Test Results
        </button>
      </div>

      {/* Generate Test Data Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Data Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories?.categories.map((category: string) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              {selectedCategory && categories?.categoryDescriptions[selectedCategory] && (
                <p className="text-sm text-gray-500 mt-1">
                  {categories?.categoryDescriptions[selectedCategory]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Records
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={testDataCount}
                onChange={(e) => setTestDataCount(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generateTestData}
              disabled={loading || !selectedCategory}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Generate Test Data</span>
            </button>

            <button
              onClick={cleanupTestData}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cleanup Test Data
            </button>
          </div>

          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Generate From Script</h2>
            <p className="text-sm text-gray-600 mb-4">Paste any Playwright script. Configure per-type counts and optional JSON hints.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Playwright Script</label>
                <textarea
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  rows={10}
                  placeholder={`import { test } from '@playwright/test';\n\n...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Positive Count</label>
                    <input type="number" min={0} value={posCount} onChange={(e) => setPosCount(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Negative Count</label>
                    <input type="number" min={0} value={negCount} onChange={(e) => setNegCount(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Boundary Count</label>
                    <input type="number" min={0} value={bndCount} onChange={(e) => setBndCount(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Equivalence Count</label>
                    <input type="number" min={0} value={eqvCount} onChange={(e) => setEqvCount(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Security Count</label>
                    <input type="number" min={0} value={secCount} onChange={(e) => setSecCount(parseInt(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Seed</label>
                    <input type="number" value={seedValue ?? ''} onChange={(e) => setSeedValue(e.target.value ? parseInt(e.target.value) : undefined)} className="w-full px-2 py-1 border border-gray-300 rounded" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-gray-700 mb-1">Field Hints (JSON)</label>
                  <textarea value={fieldHintsText} onChange={(e) => setFieldHintsText(e.target.value)} rows={4} placeholder='[{"fieldName":"Age","fieldType":"number","min":0,"max":120}]' className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs" />
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-gray-700 mb-1">Locales (JSON)</label>
                  <textarea value={localesText} onChange={(e) => setLocalesText(e.target.value)} rows={2} placeholder='["en-US"]' className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs" />
                </div>
                <div className="mt-4">
                  <button onClick={generateFromScript} disabled={loading || !scriptCode} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors">
                    Generate From Script
                  </button>
                </div>
              </div>
            </div>
          </div>

          {testData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Generated {testData.length} Test Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testData.slice(0, 6).map((data, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <pre className="text-xs text-gray-600 overflow-hidden">
                      {JSON.stringify(data, null, 2).substring(0, 100)}...
                    </pre>
                  </div>
                ))}
              </div>
              {testData.length > 6 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... and {testData.length - 6} more records
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Run Tests Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Test Data Status
            </h3>
            <p className="text-yellow-700">
              {testData.length > 0
                ? `Ready to test with ${testData.length} generated records`
                : 'No test data generated. Please generate test data first.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => runTests('unit-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>🧪</span>
              <span>Unit Tests</span>
            </button>
            <button
              onClick={() => runTests('integration-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>🔗</span>
              <span>Integration Tests</span>
            </button>
            <button
              onClick={() => runTests('performance-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>⚡</span>
              <span>Performance Tests</span>
            </button>
            <button
              onClick={() => runTests('load-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>👥</span>
              <span>Load Tests</span>
            </button>
            <button
              onClick={() => runTests('security-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>🔒</span>
              <span>Security Tests</span>
            </button>
            <button
              onClick={() => runTests('data-integrity-tests')}
              disabled={loading || testData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>🔍</span>
              <span>Data Integrity Tests</span>
            </button>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={runComprehensiveSuite}
              disabled={loading || testData.length === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors w-full md:w-auto"
            >
              <span>🎯</span>
              <span>Run Comprehensive Test Suite</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {testSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Test Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{testSummary.total}</div>
                  <div className="text-sm text-blue-600">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{testSummary.passed}</div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{testSummary.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{testSummary.successRate}</div>
                  <div className="text-sm text-purple-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}

          {testResults.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result: TestResult, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.passed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm px-2 py-1 rounded ${
                            result.passed
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                          >
                            {result.passed ? 'PASS' : 'FAIL'}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {result.testType.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800">{result.testName}</h4>
                        {result.message && (
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {result.executionTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Test Results</h3>
              <p className="text-gray-500">
                Run some tests to see results here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseTesting;