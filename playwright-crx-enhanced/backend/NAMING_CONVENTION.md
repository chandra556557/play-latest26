# Script Naming Convention Documentation

## Purpose
This document outlines the standardized naming convention for test scripts to ensure consistency, readability, and maintainability across the project.

## Naming Convention Format
```
[Feature Area]_[Test Type]_[Specific Action/Behavior]_[Environment(Optional)]
```

## Components

### 1. Feature Area
Describes the main functionality being tested:
- `login` - Authentication and login functionality
- `search` - Search functionality
- `cart` - Shopping cart operations
- `checkout` - Purchase checkout process
- `api_auth` - API authentication
- `user_profile` - User profile management
- `dashboard` - Dashboard functionality
- `settings` - Application settings
- `notifications` - Notification system
- `reports` - Reporting functionality

### 2. Test Type
Indicates the type of test:
- `positive` - Valid inputs/successful scenarios
- `negative` - Invalid inputs/error scenarios
- `e2e` - End-to-end flows
- `ui` - User interface tests
- `api` - API endpoint tests
- `performance` - Performance/load tests
- `accessibility` - Accessibility tests
- `security` - Security-related tests
- `integration` - Integration tests
- `smoke` - Smoke tests

### 3. Specific Action/Behavior
Describes the exact action or behavior being tested:
- `validCredentials` - Using valid credentials
- `invalidInput` - Using invalid input
- `addItem` - Adding an item
- `editPersonalInfo` - Editing personal information
- `loadTime` - Measuring loading time
- `clickButton` - Clicking a specific button
- `submitForm` - Submitting a form
- `validateField` - Validating a field

### 4. Environment (Optional)
Specifies the environment or browser if relevant:
- `_Chrome`
- `_Firefox` 
- `_Safari`
- `_Mobile`
- `_Desktop`
- `_iOS`
- `_Android`

## Examples

### Positive Test Cases
- `login_ui_positive_validCredentials_LoginSuccess`
- `search_function_positive_validInput_SearchResults`
- `cart_e2e_addItemsAndViewCart_Chrome`

### Negative Test Cases
- `login_ui_negative_invalidCredentials_LoginFailure`
- `search_function_negative_invalidInput_SearchFailure`
- `checkout_payment_negative_insufficientFunds_Rejection`

### API Tests
- `api_auth_getUserData_SessionToken`
- `api_users_postValidUser_CreationSuccess`
- `api_products_getInvalidProduct_NotFound`

### End-to-End Tests
- `checkout_e2e_completePurchaseFlow_GuestUser`
- `registration_e2e_createAccountAndVerify_Email`

### Performance Tests
- `dashboard_performance_loadTime_Under3Sec`
- `api_response_time_getUsers_Under500ms`

## Benefits

1. **Clarity**: Immediately understand what the test covers
2. **Organization**: Group related tests by feature area
3. **Searchability**: Easy to find specific tests
4. **Maintainability**: Clear purpose makes updates easier
5. **Reporting**: More informative test names in reports