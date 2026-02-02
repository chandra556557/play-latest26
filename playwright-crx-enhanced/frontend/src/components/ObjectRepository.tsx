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
  const [activeTab, setActiveTab] = useState<'pages' | 'elements' | 'statistics' | 'dependencies' | 'import'>('pages');
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

  // Import script state
  const [scriptToImport, setScriptToImport] = useState('');
  const [importedElements, setImportedElements] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importPageUrl, setImportPageUrl] = useState('');
  const [importPageName, setImportPageName] = useState('');

  // Dependencies state
  const [dependencyGraph, setDependencyGraph] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [selectedElementForDep, setSelectedElementForDep] = useState<string>('');
  const [newDependency, setNewDependency] = useState<{
    dependentElementId: string;
    dependencyType: 'contains' | 'precedes' | 'blocks' | 'enables';
    description: string;
    isMandatory: boolean;
  }>({ 
    dependentElementId: '', 
    dependencyType: 'precedes', 
    description: '', 
    isMandatory: true 
  });

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
    loadAllElements(); // Load all elements for Dependencies tab
  }, [projectId]);

  useEffect(() => {
    if (searchQuery || filterCategory || filterHealthy !== null) {
      searchElements();
    }
  }, [searchQuery, filterCategory, filterHealthy]);

  // Load elements when switching to dependencies tab
  useEffect(() => {
    if (activeTab === 'dependencies' && elements.length === 0) {
      loadAllElements();
    }
  }, [activeTab]);

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

  const loadAllElements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Search with empty criteria to get all elements
      const response = await fetch(`${API_BASE_URL}/elements/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setElements(data.data);
      } else {
        setError(data.error || 'Failed to load elements');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load elements');
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

  // ==================== Import Script Parsing ====================

  const parseScriptForElements = (script: string) => {
    const elements: any[] = [];
    const lines = script.split('\n');
    let urlFound = '';

    // Extract URL from goto
    const gotoMatch = script.match(/page\.goto\(['"]([^'"]+)['"]\)/);
    if (gotoMatch) {
      urlFound = gotoMatch[1];
    }

    // Patterns to match different locator types
    const patterns = [
      { regex: /\.getByRole\(['"]([^'"]+)['"](?:,\s*\{[^}]*name:\s*['"]([^'"]+)['"])?/g, type: 'role' },
      { regex: /\.getByText\(['"]([^'"]+)['"]\)/g, type: 'text' },
      { regex: /\.getByLabel\(['"]([^'"]+)['"]\)/g, type: 'label' },
      { regex: /\.getByPlaceholder\(['"]([^'"]+)['"]\)/g, type: 'placeholder' },
      { regex: /\.getByTestId\(['"]([^'"]+)['"]\)/g, type: 'testid' },
      { regex: /\.getByTitle\(['"]([^'"]+)['"]\)/g, type: 'title' },
      { regex: /\.locator\(['"]([^'"]+)['"]\)/g, type: 'locator' },
      { regex: /\$\(['"]([^'"]+)['"]\)/g, type: 'css' },
    ];

    lines.forEach((line, index) => {
      patterns.forEach(({ regex, type }) => {
        const matches = [...line.matchAll(regex)];
        matches.forEach(match => {
          const selector = match[1];
          const name = match[2] || match[1];
          
          let action = 'unknown';
          if (line.includes('.click(')) action = 'click';
          else if (line.includes('.fill(')) action = 'fill';
          else if (line.includes('.type(')) action = 'type';
          else if (line.includes('.check(')) action = 'check';
          else if (line.includes('.selectOption(')) action = 'select';

          let elementType = 'custom';
          if (action === 'fill' || action === 'type') elementType = 'input';
          else if (action === 'click' && selector.includes('button')) elementType = 'button';
          else if (action === 'click' && selector.includes('link')) elementType = 'link';

          const elementName = selector.replace(/[#.\[\]"'=]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');

          elements.push({ name: elementName, displayName: name, selector, type, elementType, action, line: index + 1 });
        });
      });
    });

    return { elements, url: urlFound };
  };

  const handleImportScript = () => {
    setImportLoading(true);
    try {
      const { elements, url } = parseScriptForElements(scriptToImport);
      setImportedElements(elements);
      setImportPageUrl(url);
      if (url) {
        const urlObj = new URL(url);
        const pageName = urlObj.pathname.split('/').filter(Boolean).pop() || 'homepage';
        setImportPageName(pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page');
      }
    } catch (err: any) {
      setError('Failed to parse script: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSaveImportedElements = async () => {
    setImportLoading(true);
    try {
      const pageResponse = await fetch(`${API_BASE_URL}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: importPageName, displayName: importPageName, url: importPageUrl, projectId: projectId || '' })
      });
      const pageData = await pageResponse.json();
      const pageId = pageData.data.id;

      await Promise.all(importedElements.map(elem =>
        fetch(`${API_BASE_URL}/elements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: elem.name,
            displayName: elem.displayName,
            pageObjectId: pageId,
            category: elem.elementType,
            cssSelector: elem.selector,
            locators: [{ type: elem.type, value: elem.selector, priority: 1 }],
            url: importPageUrl
          })
        })
      ));

      // Reload data and show imported elements
      await loadPages();
      await loadAllElements(); // Load all elements so they appear in Elements tab
      setScriptToImport('');
      setImportedElements([]);
      setImportPageName('');
      setImportPageUrl('');
      setActiveTab('elements'); // Switch to Elements tab to show imported elements
      alert(`✅ Successfully imported ${importedElements.length} elements! Switch to Elements tab to view them.`);
    } catch (err: any) {
      setError('Failed to save: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  // ==================== Dependency Management ====================

  const loadDependencyGraph = async (elementId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies/element/${elementId}`);
      const data = await response.json();
      if (data.success) {
        setDependencyGraph(data.data);
        setSelectedElementForDep(elementId);
      } else {
        setError(data.error || 'Failed to load dependency graph');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dependency graph');
    } finally {
      setLoading(false);
    }
  };

  const loadImpactAnalysis = async (elementId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies/impact/${elementId}`);
      const data = await response.json();
      if (data.success) {
        setImpactAnalysis(data.data);
      } else {
        setError(data.error || 'Failed to analyze impact');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze impact');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDependency = async () => {
    if (!selectedElementForDep || !newDependency.dependentElementId) {
      setError('Please select both parent and dependent elements');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentElementId: selectedElementForDep,
          ...newDependency
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Dependency created successfully!');
        loadDependencyGraph(selectedElementForDep);
        setNewDependency({
          dependentElementId: '',
          dependencyType: 'precedes',
          description: '',
          isMandatory: true
        });
      } else {
        setError(data.error || 'Failed to create dependency');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    if (!confirm('Are you sure you want to delete this dependency?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dependencies/${dependencyId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Dependency deleted successfully!');
        if (selectedElementForDep) {
          loadDependencyGraph(selectedElementForDep);
        }
      } else {
        setError(data.error || 'Failed to delete dependency');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete dependency');
    } finally {
      setLoading(false);
    }
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
          className={activeTab === 'import' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('import')}
        >
          📥 Import Script
        </button>
        <button
          className={activeTab === 'statistics' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Statistics
        </button>
        <button
          className={activeTab === 'dependencies' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('dependencies')}
        >
          🔗 Dependencies
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
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('');
                  setFilterHealthy(null);
                  loadAllElements();
                }}
                className="btn btn-primary"
                style={{ marginLeft: '10px' }}
              >
                🔄 Show All Elements
              </button>
            </div>

            <div className="elements-results">
              <p>{elements.length} elements found</p>
              <div className="elements-grid">
                {elements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>🔍 No elements to display</p>
                    <p>Click "Show All Elements" button above or use search filters</p>
                  </div>
                ) : (
                  elements.map((element) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dependencies Tab */}
        {activeTab === 'dependencies' && (
          <div className="dependencies-tab">
            <div className="dependencies-header">
              <h2>🔗 Element Dependencies & Relationships</h2>
              <p>Manage element dependencies, view impact analysis, and prevent circular references</p>
            </div>

            <div className="dependency-section">
              <h3>🎯 Select Element</h3>
              <select 
                value={selectedElementForDep} 
                onChange={(e) => {
                  setSelectedElementForDep(e.target.value);
                  if (e.target.value) {
                    loadDependencyGraph(e.target.value);
                  }
                }}
                className="element-selector"
              >
                <option value="">-- Select an element to manage dependencies --</option>
                {elements.map(elem => (
                  <option key={elem.id} value={elem.id}>
                    {elem.displayName} ({elem.name})
                  </option>
                ))}
              </select>
            </div>

            {dependencyGraph && (
              <>
                <div className="dependency-section">
                  <h3>📊 Dependency Graph for {dependencyGraph.element.displayName}</h3>
                  
                  {dependencyGraph.hasCircularDependency && (
                    <div className="warning-banner">
                      ⚠️ Circular dependency detected!
                    </div>
                  )}

                  <div className="dependency-columns">
                    <div className="dependency-column">
                      <h4>🔼 Dependencies ({dependencyGraph.dependencies.length})</h4>
                      <p>Elements this element depends on</p>
                      {dependencyGraph.dependencies.length === 0 ? (
                        <p>No dependencies</p>
                      ) : (
                        <div className="dependency-list">
                          {dependencyGraph.dependencies.map((dep: any) => (
                            <div key={dep.id} className="dependency-card">
                              <div>
                                <span>{dep.parentElement.displayName}</span>
                                <span className={`type-${dep.dependencyType}`}>
                                  {dep.dependencyType}
                                </span>
                                {dep.isMandatory && <span className="mandatory-badge">mandatory</span>}
                              </div>
                              {dep.description && <p>{dep.description}</p>}
                              <button onClick={() => handleDeleteDependency(dep.id)}>
                                🗑️ Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dependency-column">
                      <h4>🔽 Dependents ({dependencyGraph.dependents.length})</h4>
                      <p>Elements that depend on this element</p>
                      {dependencyGraph.dependents.length === 0 ? (
                        <p>No dependents</p>
                      ) : (
                        <div className="dependency-list">
                          {dependencyGraph.dependents.map((dep: any) => (
                            <div key={dep.id} className="dependency-card">
                              <div>
                                <span>{dep.dependentElement.displayName}</span>
                                <span className={`type-${dep.dependencyType}`}>
                                  {dep.dependencyType}
                                </span>
                                {dep.isMandatory && <span>mandatory</span>}
                              </div>
                              {dep.description && <p>{dep.description}</p>}
                              <button onClick={() => handleDeleteDependency(dep.id)}>
                                🗑️ Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dependency-section">
                  <h3>➕ Add New Dependency</h3>
                  <div className="add-dependency-form">
                    <label>
                      Dependent Element:
                      <select 
                        value={newDependency.dependentElementId}
                        onChange={(e) => setNewDependency({...newDependency, dependentElementId: e.target.value})}
                      >
                        <option value="">-- Select element --</option>
                        {elements.filter(e => e.id !== selectedElementForDep).map(elem => (
                          <option key={elem.id} value={elem.id}>
                            {elem.displayName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Relationship Type:
                      <select 
                        value={newDependency.dependencyType}
                        onChange={(e) => setNewDependency({...newDependency, dependencyType: e.target.value as any})}
                      >
                        <option value="contains">Contains</option>
                        <option value="precedes">Precedes</option>
                        <option value="blocks">Blocks</option>
                        <option value="enables">Enables</option>
                      </select>
                    </label>

                    <label>
                      Description:
                      <input 
                        type="text"
                        value={newDependency.description}
                        onChange={(e) => setNewDependency({...newDependency, description: e.target.value})}
                      />
                    </label>

                    <label>
                      <input 
                        type="checkbox"
                        checked={newDependency.isMandatory}
                        onChange={(e) => setNewDependency({...newDependency, isMandatory: e.target.checked})}
                      />
                      Mandatory dependency
                    </label>

                    <button onClick={handleCreateDependency}>
                      ➕ Create Dependency
                    </button>
                  </div>
                </div>

                <div className="dependency-section">
                  <h3>🎯 Impact Analysis</h3>
                  <button onClick={() => loadImpactAnalysis(selectedElementForDep)}>
                    🔍 Analyze Impact
                  </button>

                  {impactAnalysis && (
                    <div>
                      <div>
                        <span>Direct: {impactAnalysis.directDependencies}</span>
                        <span>Indirect: {impactAnalysis.indirectDependencies}</span>
                        <span>Total: {impactAnalysis.totalImpactedElements}</span>
                      </div>

                      {impactAnalysis.circularDependencies.length > 0 && (
                        <div>
                          <h4>⚠️ Circular Dependencies:</h4>
                          {impactAnalysis.circularDependencies.map((circ: any, idx: number) => (
                            <div key={idx}>{circ.description}</div>
                          ))}
                        </div>
                      )}

                      {impactAnalysis.impactedElementsList.length > 0 && (
                        <table>
                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Element</th>
                              <th>Relationship</th>
                            </tr>
                          </thead>
                          <tbody>
                            {impactAnalysis.impactedElementsList.map((elem: any) => (
                              <tr key={elem.id}>
                                <td>{elem.level}</td>
                                <td>{elem.displayName}</td>
                                <td>{elem.relationshipType}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedElementForDep && (
              <div>
                <p>👆 Select an element above to view and manage its dependencies</p>
              </div>
            )}
          </div>
        )}

        {/* Import Script Tab */}
        {activeTab === 'import' && (
          <div className="import-tab">
            <div className="import-section">
              <h2>📥 Import from Playwright Script</h2>
              <p>Paste your Playwright Codegen script below to automatically extract elements</p>
              
              <textarea
                placeholder="Paste your Playwright script here...\n\nExample:\nawait page.goto('https://example.com');\nawait page.getByLabel('Username').fill('user');\nawait page.getByRole('button', { name: 'Login' }).click();"
                value={scriptToImport}
                onChange={(e) => setScriptToImport(e.target.value)}
                rows={15}
                style={{ width: '100%', fontFamily: 'monospace', padding: '12px', marginBottom: '16px' }}
              />
              
              <button 
                className="btn btn-primary" 
                onClick={handleImportScript}
                disabled={!scriptToImport || importLoading}
              >
                {importLoading ? '⏳ Parsing...' : '🔍 Parse Script'}
              </button>
            </div>

            {importedElements.length > 0 && (
              <div className="import-results">
                <h3>✅ Found {importedElements.length} Elements</h3>
                
                <div className="import-page-info">
                  <label>
                    Page Name:
                    <input
                      type="text"
                      value={importPageName}
                      onChange={(e) => setImportPageName(e.target.value)}
                      placeholder="e.g., LoginPage"
                    />
                  </label>
                  <label>
                    Page URL:
                    <input
                      type="text"
                      value={importPageUrl}
                      onChange={(e) => setImportPageUrl(e.target.value)}
                      placeholder="https://example.com/login"
                    />
                  </label>
                </div>

                <table className="import-elements-table">
                  <thead>
                    <tr>
                      <th>Element Name</th>
                      <th>Selector</th>
                      <th>Type</th>
                      <th>Action</th>
                      <th>Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedElements.map((elem, idx) => (
                      <tr key={idx}>
                        <td><code>{elem.name}</code></td>
                        <td><code>{elem.selector}</code></td>
                        <td><span className="badge">{elem.type}</span></td>
                        <td><span className="badge">{elem.action}</span></td>
                        <td>{elem.line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="import-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveImportedElements}
                    disabled={!importPageName || !importPageUrl || importLoading}
                  >
                    {importLoading ? '⏳ Saving...' : '💾 Save to Repository'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setImportedElements([])}
                  >
                    ❌ Clear
                  </button>
                </div>
              </div>
            )}
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
