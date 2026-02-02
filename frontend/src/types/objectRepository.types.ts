/**
 * Object Repository Frontend Types
 * Types and interfaces for the Object Repository UI
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
  locators?: ElementLocator[];
  primaryLocator?: ElementLocator;
  tags?: string[];
}

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
  elements?: UIElement[];
}

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

export interface CreatePageObjectRequest {
  name: string;
  displayName: string;
  description?: string;
  url: string;
  urlPattern?: string;
  projectId?: string;
  codeLanguage?: string;
  namespace?: string;
}

export interface CreateElementRequest {
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
  locators: {
    type: ElementLocatorType;
    value: string;
    confidence?: number;
    isPrimary?: boolean;
  }[];
  tags?: string[];
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

export interface PageObjectCodeResult {
  className: string;
  code: string;
  language: string;
  framework: string;
  filePath: string;
}
