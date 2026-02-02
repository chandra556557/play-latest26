/**
 * Page Object Model Code Generator
 * Generates POM code in multiple languages from the Object Repository
 */

import { PageObject, UIElement, ElementLocator } from '../types/objectRepository.types';

export interface CodeGeneratorOptions {
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';
  framework?: 'playwright' | 'selenium' | 'cypress';
  includeComments?: boolean;
  includeTypeDefinitions?: boolean;
}

export class PageObjectCodeGenerator {
  /**
   * Generate Page Object Model code
   */
  static generate(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    switch (options.language) {
      case 'typescript':
        return this.generateTypeScript(page, elements, options);
      case 'javascript':
        return this.generateJavaScript(page, elements, options);
      case 'python':
        return this.generatePython(page, elements, options);
      case 'java':
        return this.generateJava(page, elements, options);
      case 'csharp':
        return this.generateCSharp(page, elements, options);
      default:
        throw new Error(`Unsupported language: ${options.language}`);
    }
  }

  /**
   * Generate TypeScript Page Object
   */
  private static generateTypeScript(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    const className = this.toPascalCase(page.name);
    const framework = options.framework || 'playwright';
    const includeComments = options.includeComments !== false;

    let code = '';

    // Imports
    if (framework === 'playwright') {
      code += `import { Page, Locator, expect } from '@playwright/test';\n\n`;
    }

    // Class comment
    if (includeComments) {
      code += `/**\n`;
      code += ` * ${page.displayName}\n`;
      if (page.description) {
        code += ` * ${page.description}\n`;
      }
      code += ` * \n`;
      code += ` * URL: ${page.url}\n`;
      code += ` * Generated: ${new Date().toISOString()}\n`;
      code += ` */\n`;
    }

    // Class definition
    code += `export class ${className} {\n`;
    code += `  private page: Page;\n\n`;

    // Constructor
    code += `  constructor(page: Page) {\n`;
    code += `    this.page = page;\n`;
    code += `  }\n\n`;

    // Element locators as getters
    for (const element of elements) {
      const primaryLocator = element.primaryLocator || (element.locators && element.locators[0]);
      if (!primaryLocator) continue;

      if (includeComments && element.description) {
        code += `  /**\n`;
        code += `   * ${element.description}\n`;
        code += `   */\n`;
      }

      const locatorMethod = this.getPlaywrightLocator(primaryLocator);
      code += `  get ${this.toCamelCase(element.name)}(): Locator {\n`;
      code += `    return this.page.${locatorMethod};\n`;
      code += `  }\n\n`;
    }

    // Navigate method
    code += `  /**\n`;
    code += `   * Navigate to this page\n`;
    code += `   */\n`;
    code += `  async navigate(): Promise<void> {\n`;
    code += `    await this.page.goto('${page.url}');\n`;
    code += `  }\n\n`;

    // Wait for page load
    code += `  /**\n`;
    code += `   * Wait for page to be loaded\n`;
    code += `   */\n`;
    code += `  async waitForPageLoad(): Promise<void> {\n`;
    code += `    await this.page.waitForLoadState('networkidle');\n`;
    code += `  }\n\n`;

    // Helper methods for common actions
    const buttons = elements.filter(e => e.category === 'button');
    const inputs = elements.filter(e => e.category === 'input' || e.category === 'textarea');
    
    if (buttons.length > 0) {
      code += `  // Button actions\n`;
      for (const button of buttons) {
        const methodName = `click${this.toPascalCase(button.name)}`;
        code += `  async ${methodName}(): Promise<void> {\n`;
        code += `    await this.${this.toCamelCase(button.name)}.click();\n`;
        code += `  }\n\n`;
      }
    }

    if (inputs.length > 0) {
      code += `  // Input actions\n`;
      for (const input of inputs) {
        const methodName = `fill${this.toPascalCase(input.name)}`;
        code += `  async ${methodName}(value: string): Promise<void> {\n`;
        code += `    await this.${this.toCamelCase(input.name)}.fill(value);\n`;
        code += `  }\n\n`;
      }
    }

    code += `}\n`;

    return code;
  }

  /**
   * Generate JavaScript Page Object
   */
  private static generateJavaScript(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    // Similar to TypeScript but without type annotations
    const className = this.toPascalCase(page.name);
    const includeComments = options.includeComments !== false;

    let code = '';

    if (includeComments) {
      code += `/**\n`;
      code += ` * ${page.displayName}\n`;
      if (page.description) {
        code += ` * ${page.description}\n`;
      }
      code += ` */\n`;
    }

    code += `class ${className} {\n`;
    code += `  constructor(page) {\n`;
    code += `    this.page = page;\n`;
    code += `  }\n\n`;

    // Element locators
    for (const element of elements) {
      const primaryLocator = element.primaryLocator || (element.locators && element.locators[0]);
      if (!primaryLocator) continue;

      const locatorMethod = this.getPlaywrightLocator(primaryLocator);
      code += `  get ${this.toCamelCase(element.name)}() {\n`;
      code += `    return this.page.${locatorMethod};\n`;
      code += `  }\n\n`;
    }

    code += `  async navigate() {\n`;
    code += `    await this.page.goto('${page.url}');\n`;
    code += `  }\n`;

    code += `}\n\n`;
    code += `module.exports = ${className};\n`;

    return code;
  }

  /**
   * Generate Python Page Object
   */
  private static generatePython(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    const className = this.toPascalCase(page.name);
    const includeComments = options.includeComments !== false;

    let code = '';

    code += `from playwright.sync_api import Page, Locator\n\n\n`;

    if (includeComments) {
      code += `class ${className}:\n`;
      code += `    """\n`;
      code += `    ${page.displayName}\n`;
      if (page.description) {
        code += `    ${page.description}\n`;
      }
      code += `    \n`;
      code += `    URL: ${page.url}\n`;
      code += `    """\n\n`;
    } else {
      code += `class ${className}:\n\n`;
    }

    code += `    def __init__(self, page: Page):\n`;
    code += `        self.page = page\n\n`;

    // Element locators as properties
    for (const element of elements) {
      const primaryLocator = element.primaryLocator || (element.locators && element.locators[0]);
      if (!primaryLocator) continue;

      const locatorMethod = this.getPythonLocator(primaryLocator);
      code += `    @property\n`;
      code += `    def ${this.toSnakeCase(element.name)}(self) -> Locator:\n`;
      if (includeComments && element.description) {
        code += `        """${element.description}"""\n`;
      }
      code += `        return self.page.${locatorMethod}\n\n`;
    }

    code += `    def navigate(self) -> None:\n`;
    code += `        """Navigate to this page"""\n`;
    code += `        self.page.goto('${page.url}')\n\n`;

    code += `    def wait_for_page_load(self) -> None:\n`;
    code += `        """Wait for page to be loaded"""\n`;
    code += `        self.page.wait_for_load_state('networkidle')\n`;

    return code;
  }

  /**
   * Generate Java Page Object
   */
  private static generateJava(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    const className = this.toPascalCase(page.name);
    const includeComments = options.includeComments !== false;

    let code = '';

    code += `package ${page.namespace || 'pages'};\n\n`;
    code += `import com.microsoft.playwright.Page;\n`;
    code += `import com.microsoft.playwright.Locator;\n\n`;

    if (includeComments) {
      code += `/**\n`;
      code += ` * ${page.displayName}\n`;
      if (page.description) {
        code += ` * ${page.description}\n`;
      }
      code += ` * \n`;
      code += ` * URL: ${page.url}\n`;
      code += ` */\n`;
    }

    code += `public class ${className} {\n`;
    code += `    private final Page page;\n\n`;

    code += `    public ${className}(Page page) {\n`;
    code += `        this.page = page;\n`;
    code += `    }\n\n`;

    // Element locators as methods
    for (const element of elements) {
      const primaryLocator = element.primaryLocator || (element.locators && element.locators[0]);
      if (!primaryLocator) continue;

      const locatorMethod = this.getPlaywrightLocator(primaryLocator);
      code += `    public Locator get${this.toPascalCase(element.name)}() {\n`;
      code += `        return page.${locatorMethod};\n`;
      code += `    }\n\n`;
    }

    code += `    public void navigate() {\n`;
    code += `        page.navigate("${page.url}");\n`;
    code += `    }\n\n`;

    code += `    public void waitForPageLoad() {\n`;
    code += `        page.waitForLoadState(LoadState.NETWORKIDLE);\n`;
    code += `    }\n`;

    code += `}\n`;

    return code;
  }

  /**
   * Generate C# Page Object
   */
  private static generateCSharp(page: PageObject, elements: UIElement[], options: CodeGeneratorOptions): string {
    const className = this.toPascalCase(page.name);
    const includeComments = options.includeComments !== false;

    let code = '';

    code += `using Microsoft.Playwright;\n`;
    code += `using System.Threading.Tasks;\n\n`;

    code += `namespace ${page.namespace || 'Pages'}\n`;
    code += `{\n`;

    if (includeComments) {
      code += `    /// <summary>\n`;
      code += `    /// ${page.displayName}\n`;
      if (page.description) {
        code += `    /// ${page.description}\n`;
      }
      code += `    /// </summary>\n`;
    }

    code += `    public class ${className}\n`;
    code += `    {\n`;
    code += `        private readonly IPage _page;\n\n`;

    code += `        public ${className}(IPage page)\n`;
    code += `        {\n`;
    code += `            _page = page;\n`;
    code += `        }\n\n`;

    // Element locators as properties
    for (const element of elements) {
      const primaryLocator = element.primaryLocator || (element.locators && element.locators[0]);
      if (!primaryLocator) continue;

      const locatorMethod = this.getPlaywrightLocator(primaryLocator);
      code += `        public ILocator ${this.toPascalCase(element.name)} => _page.${locatorMethod};\n\n`;
    }

    code += `        public async Task NavigateAsync()\n`;
    code += `        {\n`;
    code += `            await _page.GotoAsync("${page.url}");\n`;
    code += `        }\n\n`;

    code += `        public async Task WaitForPageLoadAsync()\n`;
    code += `        {\n`;
    code += `            await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);\n`;
    code += `        }\n`;

    code += `    }\n`;
    code += `}\n`;

    return code;
  }

  /**
   * Get Playwright locator method string
   */
  private static getPlaywrightLocator(locator: ElementLocator): string {
    switch (locator.type) {
      case 'id':
        return `locator('#${locator.value}')`;
      case 'css':
        return `locator('${locator.value}')`;
      case 'xpath':
        return `locator('${locator.value}')`;
      case 'text':
        return `getByText('${locator.value}')`;
      case 'testId':
        return `getByTestId('${locator.value}')`;
      case 'role':
        return `getByRole('${locator.value}')`;
      case 'placeholder':
        return `getByPlaceholder('${locator.value}')`;
      case 'label':
        return `getByLabel('${locator.value}')`;
      case 'altText':
        return `getByAltText('${locator.value}')`;
      case 'title':
        return `getByTitle('${locator.value}')`;
      default:
        return `locator('${locator.value}')`;
    }
  }

  /**
   * Get Python Playwright locator method string
   */
  private static getPythonLocator(locator: ElementLocator): string {
    switch (locator.type) {
      case 'id':
        return `locator("#${locator.value}")`;
      case 'css':
        return `locator("${locator.value}")`;
      case 'xpath':
        return `locator("${locator.value}")`;
      case 'text':
        return `get_by_text("${locator.value}")`;
      case 'testId':
        return `get_by_test_id("${locator.value}")`;
      case 'role':
        return `get_by_role("${locator.value}")`;
      case 'placeholder':
        return `get_by_placeholder("${locator.value}")`;
      case 'label':
        return `get_by_label("${locator.value}")`;
      case 'altText':
        return `get_by_alt_text("${locator.value}")`;
      case 'title':
        return `get_by_title("${locator.value}")`;
      default:
        return `locator("${locator.value}")`;
    }
  }

  /**
   * Convert to camelCase
   */
  private static toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
              .replace(/^(.)/, char => char.toLowerCase());
  }

  /**
   * Convert to PascalCase
   */
  private static toPascalCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
              .replace(/^(.)/, char => char.toUpperCase());
  }

  /**
   * Convert to snake_case
   */
  private static toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1')
              .toLowerCase()
              .replace(/^_/, '');
  }
}
