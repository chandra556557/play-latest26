/**
 * Object Repository Types for Backend
 * Version: 1.0.0
 */

export type ElementLocatorType = 
  | 'id' 
  | 'css' 
  | 'xpath' 
  | 'text' 
  | 'testId' 
  | 'role' 
  | 'placeholder'
  | 'label'
  | 'altText'
  | 'title';

export type ElementCategory = 
  | 'button' 
  | 'input' 
  | 'link' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'textarea'
  | 'image'
  | 'heading'
  | 'text'
  | 'container'
  | 'navigation'
  | 'form'
  | 'table'
  | 'modal'
  | 'custom';

export type NamingConvention = 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';

/**
 * Page Object Model representation
 */
export interface PageObject {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  url: string;
  urlPattern?: string;
  projectId?: string;
  codeLanguage?: string;
  namespace?: string;
  testCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UI Element representation
 */
export interface UIElement {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  pageObjectId: string;
  category: ElementCategory;
  tagName: string;
  attributes: Record<string, string>;
  xpath?: string;
  cssSelector?: string;
  url?: string;
  screenshotPath?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isHealthy: boolean;
}

/**
 * Element Locator
 */
export interface ElementLocator {
  id: string;
  elementId: string;
  type: ElementLocatorType;
  value: string;
  confidence: number;
  isActive: boolean;
  isPrimary: boolean;
  lastValidated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Healing History Entry
 */
export interface HealingHistoryEntry {
  id: string;
  elementId: string;
  oldLocatorType: ElementLocatorType;
  oldLocatorValue: string;
  newLocatorType: ElementLocatorType;
  newLocatorValue: string;
  reason?: string;
  autoApplied: boolean;
  confidence?: number;
  timestamp: Date;
}

/**
 * Repository Settings
 */
export interface RepositorySettings {
  id: string;
  projectId?: string;
  preferredLocatorOrder: ElementLocatorType[];
  namingConvention: NamingConvention;
  defaultLanguage: string;
  defaultFramework: string;
  autoHealingEnabled: boolean;
  autoHealingThreshold: number;
  versioning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Element Tag
 */
export interface ElementTag {
  id: string;
  elementId: string;
  tag: string;
  createdAt: Date;
}

/**
 * Element Usage Tracking
 */
export interface ElementUsage {
  id: string;
  elementId: string;
  testRunId?: string;
  action?: string;
  success: boolean;
  errorMessage?: string;
  usedAt: Date;
}

/**
 * Complete UI Element with Locators
 */
export interface UIElementWithLocators extends UIElement {
  locators: ElementLocator[];
  primaryLocator?: ElementLocator;
  tags?: string[];
  healingHistory?: HealingHistoryEntry[];
}

/**
 * Complete Page Object with Elements
 */
export interface PageObjectWithElements extends PageObject {
  elements: UIElementWithLocators[];
}

/**
 * Object Repository Statistics
 */
export interface RepositoryStatistics {
  totalPages: number;
  totalElements: number;
  healthyElements: number;
  unhealthyElements: number;
  mostUsedElements: UIElement[];
  recentlyUpdated: UIElement[];
  locatorTypeDistribution: Record<ElementLocatorType, number>;
  categoryDistribution: Record<ElementCategory, number>;
}

/**
 * Request/Response DTOs
 */

export interface CreatePageObjectDTO {
  name: string;
  displayName: string;
  description?: string;
  url: string;
  urlPattern?: string;
  projectId?: string;
  codeLanguage?: string;
  namespace?: string;
}

export interface UpdatePageObjectDTO {
  name?: string;
  displayName?: string;
  description?: string;
  url?: string;
  urlPattern?: string;
  codeLanguage?: string;
  namespace?: string;
}

export interface CreateUIElementDTO {
  name: string;
  displayName: string;
  description?: string;
  pageObjectId: string;
  category: ElementCategory;
  tagName: string;
  attributes?: Record<string, string>;
  xpath?: string;
  cssSelector?: string;
  url?: string;
  locators: CreateLocatorDTO[];
  tags?: string[];
}

export interface CreateLocatorDTO {
  type: ElementLocatorType;
  value: string;
  confidence?: number;
  isPrimary?: boolean;
}

export interface UpdateUIElementDTO {
  name?: string;
  displayName?: string;
  description?: string;
  category?: ElementCategory;
  tagName?: string;
  attributes?: Record<string, string>;
  xpath?: string;
  cssSelector?: string;
  isHealthy?: boolean;
}

export interface ElementSearchCriteria {
  query?: string;
  pageObjectId?: string;
  category?: ElementCategory;
  locatorType?: ElementLocatorType;
  isHealthy?: boolean;
  tags?: string[];
  projectId?: string;
}

export interface BulkUpdateElementsDTO {
  elementIds: string[];
  updates: UpdateUIElementDTO;
}

export interface GeneratePageObjectCodeDTO {
  pageObjectId: string;
  language: string;
  framework?: string;
  includeComments?: boolean;
  includeTypeDefinitions?: boolean;
}

export interface PageObjectCodeResult {
  className: string;
  code: string;
  language: string;
  framework: string;
  filePath: string;
}

/**
 * Element capture from recorder
 */
export interface ElementCaptureDTO {
  name: string;
  displayName: string;
  pageUrl: string;
  category: ElementCategory;
  tagName: string;
  attributes: Record<string, string>;
  locators: CreateLocatorDTO[];
  action?: string;
  screenshot?: string;
}
