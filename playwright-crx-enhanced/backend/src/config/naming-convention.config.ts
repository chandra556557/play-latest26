// Naming Convention Configuration
// This configuration defines the standard format for test script names

interface NamingConventionConfig {
  format: string;
  description: string;
  examples: Array<{
    name: string;
    featureArea: string;
    testType: string;
    specificAction: string;
    behavior?: string;
    environment?: string;
  }>;
  featureAreas: string[];
  testTypes: string[];
  specificActions: string[];
  environments: string[];
  documentation: string;
  appliesTo: string[];
}

export const namingConventionConfig: NamingConventionConfig = {
  format: "[Feature Area]_[Test Type]_[Specific Action/Behavior]_[Environment(Optional)]",
  description: "Standardized naming convention for test scripts to ensure consistency and readability",
  examples: [
    {
      name: "login_ui_positive_validCredentials_LoginSuccess",
      featureArea: "login",
      testType: "ui",
      specificAction: "validCredentials",
      behavior: "LoginSuccess"
    },
    {
      name: "search_function_negative_invalidInput_SearchFailure",
      featureArea: "search",
      testType: "function",
      specificAction: "invalidInput",
      behavior: "SearchFailure"
    },
    {
      name: "cart_e2e_addItemsAndViewCart_Chrome",
      featureArea: "cart",
      testType: "e2e",
      specificAction: "addItemsAndViewCart",
      environment: "Chrome"
    }
  ],
  featureAreas: [
    "login", "search", "cart", "checkout", "api_auth", 
    "user_profile", "dashboard", "settings", "notifications", "reports"
  ],
  testTypes: [
    "positive", "negative", "e2e", "ui", "api", 
    "performance", "accessibility", "security", "integration", "smoke"
  ],
  specificActions: [
    "validCredentials", "invalidInput", "addItem", "editPersonalInfo", 
    "loadTime", "clickButton", "submitForm", "validateField"
  ],
  environments: [
    "Chrome", "Firefox", "Safari", "Mobile", "Desktop", "iOS", "Android"
  ],
  documentation: "./NAMING_CONVENTION.md",
  appliesTo: [
    "test scripts",
    "script name field",
    "automation scripts",
    "regression tests"
  ]
};

// Helper function to validate a script name against the convention
export function validateScriptName(scriptName: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if the script name follows the general pattern of having at least 2 underscores
  const parts = scriptName.split('_');
  if (parts.length < 3) {
    errors.push("Script name should have at least 3 parts separated by underscores");
  }
  
  // Validate each part against known categories if possible
  if (parts.length >= 2) {
    const featureArea = parts[0];
    const testType = parts[1];
    
    if (!namingConventionConfig.featureAreas.includes(featureArea)) {
      errors.push(`"${featureArea}" is not a standard feature area. Consider using one of: ${namingConventionConfig.featureAreas.join(', ')}`);
    }
    
    if (!namingConventionConfig.testTypes.includes(testType)) {
      errors.push(`"${testType}" is not a standard test type. Consider using one of: ${namingConventionConfig.testTypes.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to generate a script name based on the convention
export function generateScriptName(featureArea: string, testType: string, specificAction: string, environment?: string): string {
  let scriptName = `${featureArea}_${testType}_${specificAction}`;
  if (environment) {
    scriptName += `_${environment}`;
  }
  return scriptName;
}

// Export for use in the application
export default namingConventionConfig;