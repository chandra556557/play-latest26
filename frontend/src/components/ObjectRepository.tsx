/**
 * Object Repository Component
 * Main UI for managing the centralized element repository with Page Object Model
 */

import React, { useState, useEffect } from 'react';
import './ObjectRepository.css';
import {
  PageObject,
  UIElement,
  ElementCategory,
  ElementLocatorType,
  CreatePageObjectRequest,
  CreateElementRequest,
  RepositoryStatistics,
  ElementSearchCriteria,
} from '../types/objectRepository.types';

const API_BASE_URL = 'http://localhost:3001/api/object-repository';

interface ObjectRepositoryProps {
  projectId?: string;
}

export const ObjectRepository: React.FC<ObjectRepositoryProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'elements' | 'statistics'>('pages');
  const [pages, setPages] = useState<PageObject[]>([]);
  const [elements, setElements] = useState<UIElement[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageObject | null>(null);
  const [selectedElement, setSelectedElement] = useState<UIElement | null>(null);
  const [statistics, setStatistics] = useState<RepositoryStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ElementCategory | ''>('');
  const [filterHealthy, setFilterHealthy] = useState<boolean | null>(null);

  // Modal states
  const [showPageModal, setShowPageModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Form states
  const [pageForm, setPageForm] = useState<CreatePageObjectRequest>({
    name: '',
    displayName: '',
    description: '',
    url: '',
    urlPattern: '',
    projectId: projectId || '',
    codeLanguage: 'typescript',
    namespace: '',
  });

  const [elementForm, setElementForm] = useState<CreateElementRequest>({
    name: '',
    displayName: '',
    description: '',
    pageObjectId: '',
    category: 'custom',
    tagName: '',
    attributes: {},
    xpath: '',
    cssSelector: '',
    url: '',
    locators: [],
    tags: [],
  });

  // Load data on mount
  useEffect(() => {
    loadPages();
    loadStatistics();
  }, [projectId]);

  useEffect(() => {
    if (searchQuery || filterCategory || filterHealthy !== null) {
      searchElements();
    } else {
      setElements([]);
    }
  }, [searchQuery, filterCategory, filterHealthy]);

  // ==================== API Calls ====================

  const loadPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = projectId ? `${API_BASE_URL}/pages?projectId=${projectId}` : `${API_BASE_URL}/pages`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPages(data.data);
      } else {
        setError(data.error || 'Failed to load pages');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const loadPageWithElements = async (pageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pages/${pageId}?includeElements=true`);
      const data = await response.json();
      if (data.success) {
        setSelectedPage(data.data);
        setElements(data.data.elements || []);
      } else {
        setError(data.error || 'Failed to load page');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const searchElements = async () => {
    const criteria: ElementSearchCriteria = {
      query: searchQuery || undefined,
      category: (filterCategory || undefined) as ElementCategory | undefined,
      isHealthy: filterHealthy !== null ? filterHealthy : undefined,
      projectId: projectId || undefined,
    };

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/elements/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });
      const data = await response.json();
      if (data.success) {
        setElements(data.data);
      } else {
        setError(data.error || 'Failed to search elements');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search elements');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const url = projectId ? `${API_BASE_URL}/statistics?projectId=${projectId}` : `${API_BASE_URL}/statistics`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const createPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm),
      });
      const data = await response.json();
      if (data.success) {
        setShowPageModal(false);
        loadPages();
        resetPageForm();
      } else {
        setError(data.error || 'Failed to create page');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  const createElement = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elementForm),
      });
      const data = await response.json();
      if (data.success) {
        setShowElementModal(false);
        if (selectedPage) {
          loadPageWithElements(selectedPage.id);
        }
        resetElementForm();
      } else {
        setError(data.error || 'Failed to create element');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create element');
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page object and all its elements?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadPages();
        if (selectedPage?.id === pageId) {
          setSelectedPage(null);
          setElements([]);
        }
      } else {
        setError(data.error || 'Failed to delete page');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete page');
    } finally {
      setLoading(false);
    }
  };

  const deleteElement = async (elementId: string) => {
    if (!confirm('Are you sure you want to delete this element?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/elements/${elementId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        if (selectedPage) {
          loadPageWithElements(selectedPage.id);
        }
      } else {
        setError(data.error || 'Failed to delete element');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete element');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Helper Functions ====================

  const resetPageForm = () => {
    setPageForm({
      name: '',
      displayName: '',
      description: '',
      url: '',
      urlPattern: '',
      projectId: projectId || '',
      codeLanguage: 'typescript',
      namespace: '',
    });
  };

  const resetElementForm = () => {
    setElementForm({
      name: '',
      displayName: '',
      description: '',
      pageObjectId: selectedPage?.id || '',
      category: 'custom',
      tagName: '',
      attributes: {},
      xpath: '',
      cssSelector: '',
      url: '',
      locators: [],
      tags: [],
    });
  };

  const addLocatorToForm = () => {
    setElementForm({
      ...elementForm,
      locators: [
        ...elementForm.locators,
        { type: 'css', value: '', confidence: 1.0, isPrimary: elementForm.locators.length === 0 },
      ],
    });
  };

  const removeLocatorFromForm = (index: number) => {
    const newLocators = [...elementForm.locators];
    newLocators.splice(index, 1);
    setElementForm({ ...elementForm, locators: newLocators });
  };

  const updateLocatorInForm = (index: number, field: string, value: any) => {
    const newLocators = [...elementForm.locators];
    newLocators[index] = { ...newLocators[index], [field]: value };
    setElementForm({ ...elementForm, locators: newLocators });
  };

  // ==================== Render ====================

  return (
    <div className="object-repository">
      <div className="object-repository-header">
        <h1>📦 Object Repository</h1>
        <p>Centralized Element Repository with Page Object Model</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'pages' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('pages')}
        >
          📄 Page Objects ({pages.length})
        </button>
        <button
          className={activeTab === 'elements' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('elements')}
        >
          🎯 Elements
        </button>
        <button
          className={activeTab === 'statistics' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Statistics
        </button>
      </div>

      <div className="tab-content">
        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="pages-tab">
            <div className="tab-toolbar">
              <button className="btn btn-primary" onClick={() => setShowPageModal(true)}>
                ➕ New Page Object
              </button>
              <button className="btn btn-secondary" onClick={loadPages}>
                🔄 Refresh
              </button>
            </div>

            <div className="pages-grid">
              {pages.map((page) => (
                <div key={page.id} className="page-card">
                  <div className="page-card-header">
                    <h3>{page.displayName}</h3>
                    <div className="page-card-actions">
                      <button onClick={() => loadPageWithElements(page.id)} title="View Elements">
                        👁️
                      </button>
                      <button onClick={() => deletePage(page.id)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="page-card-body">
                    <p className="page-name">{page.name}</p>
                    <p className="page-url">{page.url}</p>
                    {page.description && <p className="page-description">{page.description}</p>}
                    <div className="page-meta">
                      <span className="badge">{page.codeLanguage || 'typescript'}</span>
                      <span className="badge">{page.testCount} tests</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPage && (
              <div className="page-elements">
                <div className="page-elements-header">
                  <h2>Elements in {selectedPage.displayName}</h2>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setElementForm({ ...elementForm, pageObjectId: selectedPage.id });
                      setShowElementModal(true);
                    }}
                  >
                    ➕ Add Element
                  </button>
                </div>

                <div className="elements-list">
                  {elements.map((element) => (
                    <div key={element.id} className="element-card">
                      <div className="element-header">
                        <div>
                          <h4>{element.displayName}</h4>
                          <span className="element-name">{element.name}</span>
                        </div>
                        <div className="element-actions">
                          <span className={`health-badge ${element.isHealthy ? 'healthy' : 'unhealthy'}`}>
                            {element.isHealthy ? '✓ Healthy' : '✗ Unhealthy'}
                          </span>
                          <button onClick={() => setSelectedElement(element)} title="Details">
                            ℹ️
                          </button>
                          <button onClick={() => deleteElement(element.id)} title="Delete">
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="element-body">
                        <p className="element-category">
                          <span className="label">Category:</span> {element.category}
                        </p>
                        <p className="element-tag">
                          <span className="label">Tag:</span> {element.tagName}
                        </p>
                        {element.primaryLocator && (
                          <p className="element-locator">
                            <span className="label">Locator:</span> {element.primaryLocator.type} = {element.primaryLocator.value}
                          </p>
                        )}
                        <p className="element-usage">
                          <span className="label">Usage:</span> {element.usageCount} times
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elements Search Tab */}
        {activeTab === 'elements' && (
          <div className="elements-tab">
            <div className="search-panel">
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ElementCategory | '')}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="button">Button</option>
                <option value="input">Input</option>
                <option value="link">Link</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
                <option value="select">Select</option>
                <option value="textarea">Textarea</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={filterHealthy === null ? '' : filterHealthy ? 'true' : 'false'}
                onChange={(e) => setFilterHealthy(e.target.value === '' ? null : e.target.value === 'true')}
                className="filter-select"
              >
                <option value="">All Elements</option>
                <option value="true">Healthy Only</option>
                <option value="false">Unhealthy Only</option>
              </select>
            </div>

            <div className="elements-results">
              <p>{elements.length} elements found</p>
              <div className="elements-grid">
                {elements.map((element) => (
                  <div key={element.id} className="element-result-card">
                    <h4>{element.displayName}</h4>
                    <p className="element-name">{element.name}</p>
                    <div className="element-meta">
                      <span className="badge">{element.category}</span>
                      <span className={`health-badge ${element.isHealthy ? 'healthy' : 'unhealthy'}`}>
                        {element.isHealthy ? '✓' : '✗'}
                      </span>
                    </div>
                    {element.primaryLocator && (
                      <p className="element-locator-preview">
                        {element.primaryLocator.type}: {element.primaryLocator.value}
                      </p>
                    )}
                    <button
                      className="btn btn-small"
                      onClick={() => setSelectedElement(element)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && statistics && (
          <div className="statistics-tab">
            <div className="statistics-grid">
              <div className="stat-card">
                <h3>Total Pages</h3>
                <p className="stat-value">{statistics.totalPages}</p>
              </div>
              <div className="stat-card">
                <h3>Total Elements</h3>
                <p className="stat-value">{statistics.totalElements}</p>
              </div>
              <div className="stat-card">
                <h3>Healthy Elements</h3>
                <p className="stat-value">{statistics.healthyElements}</p>
              </div>
              <div className="stat-card">
                <h3>Unhealthy Elements</h3>
                <p className="stat-value">{statistics.unhealthyElements}</p>
              </div>
            </div>

            <div className="statistics-section">
              <h3>Most Used Elements</h3>
              <div className="elements-list">
                {statistics.mostUsedElements.map((element) => (
                  <div key={element.id} className="element-usage-card">
                    <span className="element-name">{element.displayName}</span>
                    <span className="usage-count">{element.usageCount} uses</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="statistics-section">
              <h3>Locator Type Distribution</h3>
              <div className="distribution-grid">
                {Object.entries(statistics.locatorTypeDistribution).map(([type, count]) => (
                  <div key={type} className="distribution-card">
                    <span>{type}</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="statistics-section">
              <h3>Category Distribution</h3>
              <div className="distribution-grid">
                {Object.entries(statistics.categoryDistribution).map(([category, count]) => (
                  <div key={category} className="distribution-card">
                    <span>{category}</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showPageModal && (
        <div className="modal-overlay" onClick={() => setShowPageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Page Object</h2>
              <button onClick={() => setShowPageModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={pageForm.name}
                  onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                  placeholder="e.g., LoginPage, DashboardPage"
                />
              </div>
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  value={pageForm.displayName}
                  onChange={(e) => setPageForm({ ...pageForm, displayName: e.target.value })}
                  placeholder="e.g., Login Page, Dashboard Page"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={pageForm.description}
                  onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                  placeholder="Describe this page..."
                />
              </div>
              <div className="form-group">
                <label>URL *</label>
                <input
                  type="text"
                  value={pageForm.url}
                  onChange={(e) => setPageForm({ ...pageForm, url: e.target.value })}
                  placeholder="https://example.com/login"
                />
              </div>
              <div className="form-group">
                <label>URL Pattern (Regex)</label>
                <input
                  type="text"
                  value={pageForm.urlPattern}
                  onChange={(e) => setPageForm({ ...pageForm, urlPattern: e.target.value })}
                  placeholder=".*/login.*"
                />
              </div>
              <div className="form-group">
                <label>Code Language</label>
                <select
                  value={pageForm.codeLanguage}
                  onChange={(e) => setPageForm({ ...pageForm, codeLanguage: e.target.value })}
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                </select>
              </div>
              <div className="form-group">
                <label>Namespace</label>
                <input
                  type="text"
                  value={pageForm.namespace}
                  onChange={(e) => setPageForm({ ...pageForm, namespace: e.target.value })}
                  placeholder="e.g., com.example.pages"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPageModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createPage} disabled={loading}>
                {loading ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Element Modal */}
      {showElementModal && (
        <div className="modal-overlay" onClick={() => setShowElementModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create UI Element</h2>
              <button onClick={() => setShowElementModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={elementForm.name}
                  onChange={(e) => setElementForm({ ...elementForm, name: e.target.value })}
                  placeholder="e.g., loginButton, emailInput"
                />
              </div>
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  value={elementForm.displayName}
                  onChange={(e) => setElementForm({ ...elementForm, displayName: e.target.value })}
                  placeholder="e.g., Login Button, Email Input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={elementForm.description}
                  onChange={(e) => setElementForm({ ...elementForm, description: e.target.value })}
                  placeholder="Describe this element..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={elementForm.category}
                    onChange={(e) => setElementForm({ ...elementForm, category: e.target.value as ElementCategory })}
                  >
                    <option value="button">Button</option>
                    <option value="input">Input</option>
                    <option value="link">Link</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tag Name *</label>
                  <input
                    type="text"
                    value={elementForm.tagName}
                    onChange={(e) => setElementForm({ ...elementForm, tagName: e.target.value })}
                    placeholder="e.g., button, input, div"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Locators * (at least one required)</label>
                <div className="locators-list">
                  {elementForm.locators.map((locator, index) => (
                    <div key={index} className="locator-item">
                      <select
                        value={locator.type}
                        onChange={(e) => updateLocatorInForm(index, 'type', e.target.value)}
                      >
                        <option value="id">ID</option>
                        <option value="css">CSS</option>
                        <option value="xpath">XPath</option>
                        <option value="text">Text</option>
                        <option value="testId">Test ID</option>
                        <option value="role">Role</option>
                        <option value="placeholder">Placeholder</option>
                        <option value="label">Label</option>
                      </select>
                      <input
                        type="text"
                        value={locator.value}
                        onChange={(e) => updateLocatorInForm(index, 'value', e.target.value)}
                        placeholder="Locator value"
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={locator.isPrimary}
                          onChange={(e) => updateLocatorInForm(index, 'isPrimary', e.target.checked)}
                        />
                        Primary
                      </label>
                      <button onClick={() => removeLocatorFromForm(index)}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-small" onClick={addLocatorToForm}>
                    ➕ Add Locator
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowElementModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createElement} disabled={loading}>
                {loading ? 'Creating...' : 'Create Element'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner">⏳ Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ObjectRepository;
