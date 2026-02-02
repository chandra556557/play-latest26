Different Types of Playwright Scripts for Test Data Generation
A Comprehensive Guide for Test Automation Engineers




1.	Introduction to Playwright Testing
 
Playwright is a modern, open-source automation framework designed for end-to-end testing of web applications. It provides cross-browser support for Chromium, Firefox, and WebKit, making it ideal for comprehensive testing scenarios.

Understanding different Playwright script patterns is crucial for effective test data generation and maintenance. This guide covers various approaches to structuring tests and extracting meaningful test data.

2.	Basic Test Structure Types

A.	Simple Test Scripts
The fundamental building block of Playwright testing:

 
B.	Tests with Hooks
Tests that include setup and teardown operations:

import { test, expect } from '@playwright/test'; test.describe('User Management Tests', () => {
test.beforeEach(async ({ page }) => {
// Setup: Navigate to application and login await page.goto('https://example.com/login');
await page.fill('#username', 'admin@example.com'); await page.fill('#password', 'admin123');
await page.click('#login-button');
await expect(page).toHaveURL(/admin-dashboard/);
});

test.afterEach(async ({ page }) => {
// Cleanup: Logout user
await page.click('#logout-button');
});

test('create new user', async ({ page }) => { await page.click('#create-user-btn');
await page.fill('#new-username', 'newuser@example.com'); await page.fill('#new-password', 'newPassword456'); await page.click('#save-user');
await expect(page.locator('.success-message')).toBeVisible();
});
});





3.	Page Object Model (POM) Pattern
The Page Object Model encapsulates page elements and actions into reusable classes, improving test maintainability and reducing code duplication.

Page Object Class Definition

// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
 
readonly page: Page;
readonly usernameInput: Locator; readonly passwordInput: Locator; readonly submitButton: Locator; readonly errorMessage: Locator;

constructor(page: Page) { this.page = page;
this.usernameInput = page.locator('#username'); this.passwordInput = page.locator('#password'); this.submitButton = page.locator('#submit-btn'); this.errorMessage = page.locator('.error-message');
}

async goto() {
await this.page.goto('https://example.com/login');
}

async login(username: string, password: string) { await this.usernameInput.fill(username);
await this.passwordInput.fill(password); await this.submitButton.click();
}

async getErrorMessage() {
return await this.errorMessage.textContent();
}
}

Test Implementation Using POM

// tests/login.spec.ts
import { test, expect } from '@playwright/test'; import { LoginPage } from '../pages/LoginPage';

test('successful login with valid credentials', async ({ page }) => { const loginPage = new LoginPage(page);

await loginPage.goto();
await loginPage.login('valid@example.com', 'validPassword123');

await expect(page).toHaveURL(/dashboard/);
});

test('failed login with invalid credentials', async ({ page }) => { const loginPage = new LoginPage(page);

await loginPage.goto();
await loginPage.login('invalid@example.com', 'wrongPassword');
 
 


4.	Fixture-Based Tests
Fixtures provide a way to set up test environments and share common functionality across tests.

Custom Fixture Definition

// fixtures/customFixtures.ts
import { test as base } from '@playwright/test'; import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type MyFixtures = { loginPage: LoginPage;
dashboardPage: DashboardPage; authenticatedUser: void;
};

export const test = base.extend<MyFixtures>({ loginPage: async ({ page }, use) => {
const loginPage = new LoginPage(page); await loginPage.goto();
await use(loginPage);
},

dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page));
},

authenticatedUser: async ({ loginPage }, use) => {
await loginPage.login('testuser@example.com', 'testPassword123'); await use();
// Cleanup happens automatically
},
});



Using Custom Fixtures in Tests
 
 


5.	Data-Driven Testing Patterns
Data-driven testing separates test logic from test data, enabling the same test to run with multiple datasets.

A.	JSON-Based Data-Driven Tests
Test Data File (testData/users.json):

 
Test Implementation:


B.	CSV-Based Data-Driven Tests
Test Data File (testData/loginData.csv):


Test Implementation:


import { test, expect } from '@playwright/test'; import fs from 'fs';
import csvParser from 'csv-parser'; import path from 'path';

interface TestData { username: string; password: string; expectedResult: string; testCase: string;
}
let testData: TestData[] = []; test.beforeAll(async () => {
const csvPath = path.join(  dirname, '../testData/loginData.csv');
 

return new Promise((resolve, reject) => { fs.createReadStream(csvPath)
.pipe(csvParser())
.on('data', (row) => { testData.push({
username: row.username, password: row.password,
expectedResult: row.expectedResult, testCase: row.testCase
});
 




});
});
 
})
.on('end', () => resolve(undefined))
.on('error', reject);
 

for (let i = 0; i < testData.length; i++) {
test(`CSV Login Test: ${testData[i]?.testCase}`, async ({ page }) => { const data = testData[i];

await page.goto('https://example.com/login'); await page.fill('#username', data.username); await page.fill('#password', data.password); await page.click('#submit');

if (data.expectedResult === 'success') { await expect(page).toHaveURL(/dashboard/);
} else {
await expect(page.locator('.error-message')).toBeVisible();
}
});
}

C.	Excel-Based Data-Driven Tests
 
function loadExcelData(filePath: string): ExcelTestData[] { const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[sheetName];

const jsonData = xlsx.utils.sheet_to_json(worksheet);

return jsonData.map((row: any) => ({ testId: row['Test_ID'],
username: row['Username'], password: row['Password'], firstName: row['First_Name'], lastName: row['Last_Name'], email: row['Email'],
expectedResult: row['Expected_Result']
}));
}

const excelPath = path.join(  dirname, '../testData/registrationData.xlsx const testData = loadExcelData(excelPath);

for (const data of testData) {
test(`Excel Registration Test: ${data.testId}`, async ({ page }) => { await page.goto('https://example.com/register');

await page.fill('#username', data.username); await page.fill('#password', data.password); await page.fill('#firstName', data.firstName); await page.fill('#lastName', data.lastName); await page.fill('#email', data.email);

await page.click('#register-button');

if (data.expectedResult === 'success') {
await expect(page.locator('.success-message')).toBeVisible();
} else {
await expect(page.locator('.validation-error')).toBeVisible();
}
});
}

D.	API-Based Dynamic Data
 
role: string; isActive: boolean;
}
let apiTestData: ApiTestData[] = []; test.beforeAll(async () => {
try {
const response = await axios.get('https://api.example.com/test-users' headers: {
'Authorization': 'Bearer ' + process.env.API_TOKEN, 'Content-Type': 'application/json'
}
});
apiTestData = response.data.users.filter((user: any) => user.isActive if (apiTestData.length === 0) {
throw new Error('No active test users found from API');
}
} catch (error) {
console.error('Failed to fetch test data from API:', error); throw error;
}
});

for (const userData of apiTestData) {
test(`API-driven test for user: ${userData.username}`, async ({ page }) await page.goto('https://example.com/login');

await page.fill('#username', userData.username);
// In real scenarios, you might fetch password separately or use SSO await page.fill('#password', 'testPassword123');

await page.click('#login-btn');

// Verify role-specific access if (userData.role === 'admin') {
await expect(page.locator('#admin-panel')).toBeVisible();
} else {
await expect(page.locator('#user-dashboard')).toBeVisible();
}

// Verify user information
await expect(page.locator('#user-email')).toContainText(userData.emai
});
}




6.	Locator Strategy Types
 
Playwright provides multiple locator strategies to identify elements on the page. Understanding these patterns is crucial for effective test data generation.

A.	Role-Based Locators (Recommended)

// Role-based locators are the most reliable and user-centric test('role-based locator examples', async ({ page }) => {
await page.goto('https://example.com/form');

// Button with specific name
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: /submit/i }).click(); // Case in

// Form controls
await page.getByRole('textbox', { name: 'Username' }).fill('testuser'); await page.getByRole('textbox', { name: 'Email' }).fill('test@example.c

// Checkboxes and radio buttons
await page.getByRole('checkbox', { name: 'Subscribe to newsletter' }).c await page.getByRole('radio', { name: 'Male' }).check();

// Links and headings
await page.getByRole('link', { name: 'Privacy Policy' }).click();
await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVis
});



B.	Text-Based Locators

 
C.	Label-Based Locators


D.	Placeholder Locators


E.	Test ID Locators

test('test-id locator examples', async ({ page }) => { await page.goto('https://example.com/dashboard');

// Standard data-testid attributes
await page.getByTestId('user-profile-button').click(); await page.getByTestId('settings-menu').click();
await page.getByTestId('logout-link').click();

// Form elements with test IDs
await page.getByTestId('username-input').fill('testuser');
 
 
F.	CSS and XPath Selectors




7.	Parameterized Tests
Parameterized tests allow running the same test logic with different configurations or datasets.
 
];

// Test data parameters const searchTerms = [
{ term: 'laptop', expectedResults: 50, category: 'Electronics' },
{ term: 'books', expectedResults: 100, category: 'Books' },
{ term: 'clothing', expectedResults: 75, category: 'Fashion' }
];

// Environment parameters const environments = [
{ name: 'staging', url: 'https://staging.example.com', timeout: 10000 }
{ name: 'production', url: 'https://example.com', timeout: 5000 }
];

for (const config of browserConfigs) { test.describe(`Tests on ${config.name}`, () => {
test.use(config);

for (const env of environments) {
test(`search functionality on ${env.name}`, async ({ page }) => { await page.goto(env.url);

for (const searchData of searchTerms) {
await page.getByPlaceholder('Search...').fill(searchData.term); await page.getByRole('button', { name: 'Search' }).click();

await expect(page.locator('.search-results')).toBeVisible({ tim

const resultCount = await page.locator('.result-item').count(); expect(resultCount).toBeGreaterThan(0); expect(resultCount).toBeLessThanOrEqual(searchData.expectedResu

// Verify category filter
await expect(page.locator(`[data-category="${searchData.categor

 





}
});
}
 



}
});
 
// Clear search for next iteration
await page.getByRole('button', { name: 'Clear' }).click();
 



 

8.	API Testing Pattern
Playwright supports API testing alongside UI testing, enabling comprehensive end-to-end testing workflows.
 

import { test, expect } from '@playwright/test';

test.describe('API Testing Examples', () => {
test('user registration API and UI flow', async ({ request, page }) =>
// Step 1: Create user via API const newUser = {
username: `testuser_${Date.now()}`, email: `test_${Date.now()}@example.com`, password: 'SecurePassword123!', firstName: 'Test',
lastName: 'User'
};

const createResponse = await request.post('https://api.example.com/us data: newUser,
headers: {
'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.API_TOKEN
}
});

expect(createResponse.ok()).toBeTruthy();
const createdUser = await createResponse.json(); expect(createdUser.id).toBeDefined();

// Step 2: Verify user can login via UI
await page.goto('https://example.com/login');
await page.getByLabel('Email').fill(newUser.email);
await page.getByLabel('Password').fill(newUser.password); await page.getByRole('button', { name: 'Sign In' }).click();

await expect(page).toHaveURL(/dashboard/);
await expect(page.getByText(`Welcome, ${newUser.firstName}`)).toBeVis

// Step 3: Verify user profile via API
const profileResponse = await request.get(`https://api.example.com/us headers: {
'Authorization': 'Bearer ' + process.env.API_TOKEN
}
});

expect(profileResponse.ok()).toBeTruthy(); const profile = await profileResponse.json(); expect(profile.email).toBe(newUser.email);
expect(profile.firstName).toBe(newUser.firstName);
});

test('API data validation and error handling', async ({ request }) => {
// Test with invalid data const invalidUser = {
username: '', // Invalid: empty username
email: 'invalid-email', // Invalid: malformed email
 
 


9.	Authentication Patterns
Managing authentication state across tests is crucial for efficient test execution.

Global Setup Authentication

// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) { const browser = await chromium.launch();
const page = await browser.newPage();

// Admin user authentication
await page.goto('https://example.com/login');
await page.getByLabel('Email').fill('admin@example.com'); await page.getByLabel('Password').fill('AdminPassword123!'); await page.getByRole('button', { name: 'Sign In' }).click(); await page.waitForURL('**/admin-dashboard');

// Save admin authentication state
await page.context().storageState({ path: 'auth-states/admin-auth.json'

// Regular user authentication
await page.goto('https://example.com/login');
await page.getByLabel('Email').fill('user@example.com'); await page.getByLabel('Password').fill('UserPassword123!'); await page.getByRole('button', { name: 'Sign In' }).click();
 
 
Using Saved Authentication State

// tests/admin-tests.spec.ts
import { test, expect } from '@playwright/test';

// Use saved admin authentication state
test.use({ storageState: 'auth-states/admin-auth.json' });

test.describe('Admin Features', () => {
test('admin can access user management', async ({ page }) => { await page.goto('https://example.com/admin/users');

await expect(page.getByRole('heading', { name: 'User Management' })). await expect(page.getByRole('button', { name: 'Add New User' })).toBe
});

test('admin can view system settings', async ({ page }) => { await page.goto('https://example.com/admin/settings');

await expect(page.getByText('System Configuration')).toBeVisible(); await expect(page.locator('#system-settings-form')).toBeVisible();
});
});



Authentication Fixture Pattern
 
await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD!); await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForURL('**/admin-dashboard'); await use();
// Logout happens automatically when page context is destroyed
},

authenticatedUser: async ({ page }, use) => { await page.goto('https://example.com/login');
await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
await page.getByLabel('Password').fill(process.env.USER_PASSWORD!); await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForURL('**/user-dashboard'); await use();
},
});

// Usage in tests
test('user can update profile', async ({ page, authenticatedUser }) => { await page.goto('https://example.com/profile');
await page.getByLabel('First Name').fill('Updated Name');
await page.getByRole('button', { name: 'Save Changes' }).click();
await expect(page.getByText('Profile updated successfully')).toBeVisibl
});





10.	Component Testing Pattern
Playwright supports component testing for modern web frameworks, enabling isolated testing of individual components.
 
const component = await mount(
<LoginForm onSubmit={(data) => submittedData = data} />
);

// Try to submit empty form
await component.getByRole('button', { name: 'Sign In' }).click();

await expect(component.getByText('Email is required')).toBeVisible(); await expect(component.getByText('Password is required')).toBeVisible
});

test('submits form with valid data', async ({ mount }) => { let submittedData: any = null;

const component = await mount(
<LoginForm onSubmit={(data) => submittedData = data} />
);

await component.getByLabel('Email').fill('test@example.com'); await component.getByLabel('Password').fill('password123');
await component.getByRole('button', { name: 'Sign In' }).click();

expect(submittedData).toEqual({ email: 'test@example.com', password: 'password123'
});
});
});

test.describe('UserProfile Component', () => { test('displays user information', async ({ mount }) => {
const mockUser = { id: '123',
name: 'John Doe',
email: 'john.doe@example.com', role: 'admin',
avatar: 'https://example.com/avatar.jpg'
};
const component = await mount(<UserProfile user={mockUser} />); await expect(component.getByText('John Doe')).toBeVisible();
await expect(component.getByText('john.doe@example.com')).toBeVisible await expect(component.getByText('admin')).toBeVisible();
await expect(component.locator('img[alt="User avatar"]')).toHaveAttri
});

test('handles edit mode', async ({ mount }) => { const mockUser = {
id: '123',
name: 'Jane Smith',
email: 'jane.smith@example.com', role: 'user'
 
 


11.	Key Data Extraction Points for Test Data Generation
When scanning Playwright scripts for test data generation, focus on extracting these key elements:

1.	Navigation Data

 	URLs: Extract from	calls
 	Route patterns: URL patterns used in assertions and waits
 	Navigation sequences: Multi-step navigation flows
 	Deep links: Direct links to specific application states

2.	Element Selectors

 	CSS selectors: IDs, classes, attribute selectors
 	XPath expressions: Complex element path expressions
 	Test IDs: data-testid and custom test identifiers
 	ARIA roles: Accessibility-based element identification
 	Text content: Element identification by visible text
 
 	Labels and placeholders: Form element identifiers

3.	Input Data

 	Form field values: Text inputs, passwords, emails
 	File upload paths: Document and media file references
 	Dropdown selections: Select option values and texts
 	Checkbox/radio states: Boolean and selection states
 	Date and time values: Temporal data inputs
 	Rich text content: HTML and formatted text inputs

4.	Interaction Patterns

 	Click sequences: Multi-step click interactions
 	Keyboard inputs: Key presses and combinations
 	Mouse movements: Hover and drag operations
 	Scroll behaviors: Page and element scrolling patterns
 	Touch gestures: Mobile-specific interactions

5.	Assertions and Expected Outcomes

 	URL patterns: Expected navigation destinations
 	Text content: Expected visible text and messages
 	Element states: Visibility, enabled/disabled states
 	Attribute values: Expected element properties
 	Count expectations: Expected number of elements
 	Network responses: API response validations

6.	Test Context and Configuration

 	Test descriptions: Test names and descriptions
 	Tags and metadata: Test categorization information
 	Timeout configurations: Wait times and timeouts
 	Retry settings: Test retry configurations
 	Browser configurations: Device and browser settings
 	Environment variables: Configuration parameters
 
7.	External Data Sources

 	JSON file paths: Static test data files
 	CSV file paths: Tabular test data sources
 	Excel file paths: Spreadsheet data sources
 	API endpoints: Dynamic data source URLs
 	Database connections: Database query parameters
 	Environment configurations: Environment-specific data




12.	Best Practices for Test Data Generation
1.	Separate Test Logic from Test Data
Always keep test data in external files (JSON, CSV, Excel) rather than hardcoding values in test scripts. This separation improves maintainability and allows non-technical team members to update test data.

2.	Use TypeScript Interfaces for Data Structure
Define clear interfaces for test data to ensure type safety and improve code readability. This helps catch data structure issues at compile time.

3.	Implement Data Validation
Always validate test data before using it in tests. Check for required fields, data types, and value constraints to prevent test failures due to malformed data.

4.	Handle Dynamic Data Carefully
When using dynamic data from APIs or databases, implement caching, retry mechanisms, and fallback to static data to prevent flaky tests.

5.	Maintain Version Control for Test Data
Keep test data files under version control alongside test code. This ensures traceability of changes and provides historical context for test failures.

6.	Use Environment Variables for Configuration
 
Store environment-specific values (URLs, credentials, API keys) in environment variables rather than hardcoding them. This enables tests to run across different environments.
7.	Implement Proper Error Handling
Include comprehensive error handling for data loading operations. Provide clear error messages to help diagnose issues with test data quickly.

8.	Optimize for Large Datasets
For large datasets, implement chunking and parallel execution strategies to maintain reasonable test execution times while ensuring comprehensive coverage.

9.	Document Data Requirements
Maintain clear documentation about test data requirements, including field descriptions, acceptable values, and data relationships.

10.	Use Meaningful Test Data
Use realistic and meaningful test data that reflects actual use cases. This helps identify real-world issues and makes test results more valuable.

11.	Implement Data Cleanup Strategies
For tests that modify data, implement proper cleanup mechanisms to ensure tests don't interfere with each other.

12.	Consider Test Data Privacy
When using production-like data, ensure it's properly anonymized and complies with privacy regulations like GDPR.



13.	Common Playwright Action Patterns
Reference table for common Playwright actions and the data they typically involve:
 








 




















 
Action	Data to	Example
Playwright Method
Category	Extract	Usage
selector,	UI
coordinates	customization
Simulated
Selector, text
human typing,
Text Typing	locator.type()	content,
character-by-
typing delay
character input


Scrolling	


locator.scrollIntoViewIfNeeded()
Selector, scroll position, viewport	Long pages,
infinite scroll, element visibility
Selector,	Dynamic
wait	content, AJAX Waiting	page.waitForSelector()	conditions,	responses,
timeout	loading states


Assertions	


expect().toHaveText()
Expected text, selectors, conditions	
Content verification,
state validation
URLs,
headers,	API testing,
API Requests	request.get()	request data, data setup, response	validation data


Screenshots	


page.screenshot()
File paths, element selectors, options	
Visual testing, documentation, debugging



Conclusion
This comprehensive guide covers the major types of Playwright scripts and
patterns you'll encounter when generating test data. Understanding these patterns
 
 
