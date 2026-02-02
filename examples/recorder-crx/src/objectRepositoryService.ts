/**
 * Object Repository Service for Chrome Extension
 * Connects the recorder with the Object Repository backend
 */

export interface ObjectRepositoryElement {
  id?: number;
  pageId: number;
  name: string;
  selector: string;
  locatorStrategy: 'css' | 'xpath' | 'testid' | 'text' | 'aria';
  elementType: string;
  description?: string;
  isRequired?: boolean;
  action?: string;
}

export interface ObjectRepositoryPage {
  id?: number;
  projectId?: number;
  name: string;
  urlPattern: string;
  description?: string;
}

export interface RecordedAction {
  name: string;
  locator: string;
  elementType?: string;
  url?: string;
  text?: string;
  timestamp: number;
}

export class ObjectRepositoryService {
  private baseUrl: string = 'http://localhost:3001/api/object-repository';
  private currentPage: ObjectRepositoryPage | null = null;
  private recordedElements: Map<string, ObjectRepositoryElement> = new Map();

  /**
   * Set the API base URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Extract element name from selector
   */
  private extractElementName(selector: string, action: string): string {
    // Try to extract meaningful name from selector
    let name = '';
    
    // Handle ID selectors
    if (selector.includes('#')) {
      name = selector.split('#')[1].split(/[\s>+~,.\[]/)
[0];
    }
    // Handle class selectors
    else if (selector.includes('.')) {
      name = selector.split('.')[1].split(/[\s>+~,.\[]/)
[0];
    }
    // Handle attribute selectors
    else if (selector.includes('[')) {
      const match = selector.match(/\[(.*?)=/);
      if (match) name = match[1];
    }
    // Handle tag selectors
    else {
      name = selector.split(/[\s>+~,.\[]/)
[0];
    }

    // Clean and format name
    name = name
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^[0-9]/, '_$&');

    // Add action prefix for clarity
    if (action === 'click') name = name || 'button';
    else if (action === 'fill') name = name || 'input';
    else if (action === 'press') name = name || 'field';
    else if (action === 'goto') name = 'page';

    return name || 'element';
  }

  /**
   * Detect locator strategy from selector
   */
  private detectLocatorStrategy(selector: string): 'css' | 'xpath' | 'testid' | 'text' | 'aria' {
    if (selector.startsWith('//') || selector.startsWith('(//')) {
      return 'xpath';
    } else if (selector.includes('[data-testid') || selector.includes('[data-test-id')) {
      return 'testid';
    } else if (selector.includes('text=') || selector.includes(':has-text')) {
      return 'text';
    } else if (selector.includes('[aria-') || selector.includes('role=')) {
      return 'aria';
    }
    return 'css';
  }

  /**
   * Determine element type from action and selector
   */
  private determineElementType(action: string, selector: string): string {
    if (action === 'click') {
      if (selector.includes('button') || selector.includes('[type="button"]') || 
          selector.includes('[type="submit"]')) {
        return 'button';
      } else if (selector.includes('a[') || selector.includes('a.')) {
        return 'link';
      }
      return 'button';
    } else if (action === 'fill') {
      if (selector.includes('textarea')) return 'textarea';
      if (selector.includes('[type="email"]')) return 'email';
      if (selector.includes('[type="password"]')) return 'password';
      if (selector.includes('[type="number"]')) return 'number';
      return 'input';
    } else if (action === 'select') {
      return 'select';
    } else if (action === 'check' || action === 'uncheck') {
      return 'checkbox';
    } else if (action === 'assertText') {
      return 'text';
    }
    return 'element';
  }

  /**
   * Create or get page for current URL
   */
  async ensurePage(url: string, projectId?: number): Promise<ObjectRepositoryPage> {
    try {
      // Extract page name from URL
      const urlObj = new URL(url);
      const pageName = this.extractPageName(urlObj);

      // Check if page already exists
      const response = await fetch(`${this.baseUrl}/pages?projectId=${projectId || ''}`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        const pages: ObjectRepositoryPage[] = await response.json();
        const existingPage = pages.find(p => p.urlPattern === urlObj.origin + urlObj.pathname);
        
        if (existingPage) {
          this.currentPage = existingPage;
          return existingPage;
        }
      }

      // Create new page
      const newPage: ObjectRepositoryPage = {
        projectId,
        name: pageName,
        urlPattern: urlObj.origin + urlObj.pathname,
        description: `Auto-generated from recorder on ${new Date().toLocaleString()}`
      };

      const createResponse = await fetch(`${this.baseUrl}/pages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(newPage)
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create page: ${createResponse.statusText}`);
      }

      this.currentPage = await createResponse.json();
      return this.currentPage;

    } catch (error) {
      console.error('Error ensuring page:', error);
      throw error;
    }
  }

  /**
   * Extract page name from URL
   */
  private extractPageName(url: URL): string {
    const pathname = url.pathname.replace(/\//g, '');
    if (pathname) {
      return pathname.charAt(0).toUpperCase() + pathname.slice(1) + 'Page';
    }
    return url.hostname.split('.')[0].charAt(0).toUpperCase() + 
           url.hostname.split('.')[0].slice(1) + 'Page';
  }

  /**
   * Save recorded action as element
   */
  async saveActionAsElement(action: RecordedAction, projectId?: number): Promise<void> {
    try {
      // Skip goto actions
      if (action.name === 'goto') {
        if (action.url) {
          await this.ensurePage(action.url, projectId);
        }
        return;
      }

      // Ensure we have a current page
      if (!this.currentPage && action.url) {
        await this.ensurePage(action.url, projectId);
      }

      if (!this.currentPage) {
        console.warn('No current page, cannot save element');
        return;
      }

      // Check if element already recorded (avoid duplicates)
      const elementKey = `${action.locator}-${action.name}`;
      if (this.recordedElements.has(elementKey)) {
        console.log('Element already saved:', elementKey);
        return;
      }

      // Create element
      const elementName = this.extractElementName(action.locator, action.name);
      const element: ObjectRepositoryElement = {
        pageId: this.currentPage.id!,
        name: elementName,
        selector: action.locator,
        locatorStrategy: this.detectLocatorStrategy(action.locator),
        elementType: action.elementType || this.determineElementType(action.name, action.locator),
        description: `${action.name} action recorded at ${new Date(action.timestamp).toLocaleString()}`,
        action: action.name
      };

      const response = await fetch(`${this.baseUrl}/elements`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(element)
      });

      if (!response.ok) {
        throw new Error(`Failed to save element: ${response.statusText}`);
      }

      const savedElement = await response.json();
      this.recordedElements.set(elementKey, savedElement);
      console.log('Element saved to Object Repository:', savedElement);

    } catch (error) {
      console.error('Error saving element:', error);
      throw error;
    }
  }

  /**
   * Batch save multiple actions
   */
  async saveActionsToRepository(actions: RecordedAction[], projectId?: number): Promise<{
    saved: number;
    skipped: number;
    errors: number;
  }> {
    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const action of actions) {
      try {
        await this.saveActionAsElement(action, projectId);
        saved++;
      } catch (error) {
        if (error instanceof Error && error.message.includes('already')) {
          skipped++;
        } else {
          errors++;
        }
      }
    }

    return { saved, skipped, errors };
  }

  /**
   * Get all pages
   */
  async getPages(projectId?: number): Promise<ObjectRepositoryPage[]> {
    try {
      const url = projectId 
        ? `${this.baseUrl}/pages?projectId=${projectId}`
        : `${this.baseUrl}/pages`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pages:', error);
      return [];
    }
  }

  /**
   * Get elements for a page
   */
  async getElements(pageId: number): Promise<ObjectRepositoryElement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/elements/page/${pageId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch elements: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching elements:', error);
      return [];
    }
  }

  /**
   * Clear current page and recorded elements
   */
  clearSession() {
    this.currentPage = null;
    this.recordedElements.clear();
  }

  /**
   * Get statistics
   */
  getSessionStats() {
    return {
      currentPage: this.currentPage?.name || 'None',
      recordedElements: this.recordedElements.size,
      elements: Array.from(this.recordedElements.values())
    };
  }
}

// Export singleton instance
export const objectRepositoryService = new ObjectRepositoryService();
