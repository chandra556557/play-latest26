-- =====================================================
-- Complete Database Schema Migration - Latest Version
-- Description: Comprehensive migration covering all tables with latest schema updates
-- Date: 2025-11-25
-- Database: playwrightcrx1
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- DROP EXISTING TABLES (in correct order due to foreign keys)
-- =====================================================
-- Drop auxiliary and integration tables first (respecting FK dependencies)
DROP TABLE IF EXISTS api_performance_benchmarks CASCADE;
DROP TABLE IF EXISTS api_mocks CASCADE;
DROP TABLE IF EXISTS api_contracts CASCADE;
DROP TABLE IF EXISTS api_test_cases CASCADE;
DROP TABLE IF EXISTS api_test_suites CASCADE;
DROP TABLE IF EXISTS test_data_snapshots CASCADE;
DROP TABLE IF EXISTS data_cleanup_rules CASCADE;
DROP TABLE IF EXISTS synthetic_data_templates CASCADE;
DROP TABLE IF EXISTS test_data_repositories CASCADE;
DROP TABLE IF EXISTS "APICallLog" CASCADE;
DROP TABLE IF EXISTS "ExternalAPIConfig" CASCADE;
DROP TABLE IF EXISTS "TestDataset" CASCADE;

-- Core tables
DROP TABLE IF EXISTS "Breakpoint" CASCADE;
DROP TABLE IF EXISTS "Variable" CASCADE;
DROP TABLE IF EXISTS "TestStep" CASCADE;
DROP TABLE IF EXISTS "TestRun" CASCADE;
DROP TABLE IF EXISTS "Script" CASCADE;
DROP TABLE IF EXISTS "ExtensionScript" CASCADE;
DROP TABLE IF EXISTS "TestData" CASCADE;
DROP TABLE IF EXISTS "TestSuite" CASCADE;
DROP TABLE IF EXISTS "ApiRequest" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- =====================================================
-- TABLE: User
-- =====================================================
CREATE TABLE "User" (
    id VARCHAR(200) PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_email_idx" ON "User"(email);

COMMENT ON TABLE "User" IS 'User accounts for the Playwright CRX system';
COMMENT ON COLUMN "User".id IS 'Unique user identifier (cuid)';
COMMENT ON COLUMN "User".email IS 'User email address (unique)';

-- =====================================================
-- TABLE: RefreshToken
-- =====================================================
CREATE TABLE "RefreshToken" (
    id VARCHAR(200) PRIMARY KEY,
    token VARCHAR(200) NOT NULL UNIQUE,
    "userId" VARCHAR(200) NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "revokedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"(token);

COMMENT ON TABLE "RefreshToken" IS 'JWT refresh tokens for authentication';

-- =====================================================
-- TABLE: Project
-- =====================================================
CREATE TABLE "Project" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

COMMENT ON TABLE "Project" IS 'Test automation projects';

-- =====================================================
-- TABLE: Script
-- =====================================================
CREATE TABLE "Script" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    language VARCHAR(200) NOT NULL DEFAULT 'typescript',
    code TEXT NOT NULL,
    "projectId" VARCHAR(200),
    "userId" VARCHAR(200) NOT NULL,
    "browserType" VARCHAR(200) NOT NULL DEFAULT 'chromium',
    viewport JSONB,
    "testIdAttribute" VARCHAR(200) NOT NULL DEFAULT 'data-testid',
    "workflowStatus" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") 
        REFERENCES "Project"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Script_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Script_userId_idx" ON "Script"("userId");
CREATE INDEX "Script_projectId_idx" ON "Script"("projectId");
CREATE INDEX "Script_createdAt_idx" ON "Script"("createdAt");
CREATE INDEX "Script_workflowStatus_idx" ON "Script"("workflowStatus");

COMMENT ON TABLE "Script" IS 'Playwright test scripts with AI enhancement workflow';
COMMENT ON COLUMN "Script"."workflowStatus" IS 'Workflow status: draft, ai_enhanced, testdata_ready, human_review, finalized, archived';
COMMENT ON COLUMN "Script"."updatedAt" IS 'Last modification timestamp (automatically updated)';

-- =====================================================
-- TABLE: TestRun
-- =====================================================
CREATE TABLE "TestRun" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    status VARCHAR(200) NOT NULL,
    duration INTEGER,
    "errorMsg" TEXT,
    "traceUrl" TEXT,
    "screenshotUrls" JSONB,
    "videoUrl" TEXT,
    environment VARCHAR(200),
    browser VARCHAR(200) NOT NULL DEFAULT 'chromium',
    viewport JSONB,
    "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completedAt" TIMESTAMP,
    "executionReportUrl" TEXT,
    CONSTRAINT "TestRun_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestRun_scriptId_idx" ON "TestRun"("scriptId");
CREATE INDEX "TestRun_userId_idx" ON "TestRun"("userId");
CREATE INDEX "TestRun_status_idx" ON "TestRun"(status);
CREATE INDEX "TestRun_startedAt_idx" ON "TestRun"("startedAt");

COMMENT ON TABLE "TestRun" IS 'Execution records of test scripts';

-- =====================================================
-- TABLE: TestStep
-- =====================================================
CREATE TABLE "TestStep" (
    id VARCHAR(200) PRIMARY KEY,
    "testRunId" VARCHAR(200) NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    action VARCHAR(200) NOT NULL,
    selector TEXT,
    value TEXT,
    status VARCHAR(200) NOT NULL,
    duration INTEGER,
    "errorMsg" TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestStep_testRunId_fkey" FOREIGN KEY ("testRunId") 
        REFERENCES "TestRun"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestStep_testRunId_idx" ON "TestStep"("testRunId");
CREATE INDEX "TestStep_stepNumber_idx" ON "TestStep"("stepNumber");

COMMENT ON TABLE "TestStep" IS 'Individual steps within a test run';

-- =====================================================
-- TABLE: ExtensionScript
-- =====================================================
CREATE TABLE "ExtensionScript" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    "scriptType" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ExtensionScript_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ExtensionScript_userId_idx" ON "ExtensionScript"("userId");
CREATE INDEX "ExtensionScript_scriptType_idx" ON "ExtensionScript"("scriptType");

COMMENT ON TABLE "ExtensionScript" IS 'Chrome extension automation scripts';

-- =====================================================
-- TABLE: Variable
-- =====================================================
CREATE TABLE "Variable" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Variable_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Variable_scriptId_name_key" UNIQUE ("scriptId", name)
);

CREATE INDEX "Variable_scriptId_idx" ON "Variable"("scriptId");

COMMENT ON TABLE "Variable" IS 'Script-level variables and configuration';

-- =====================================================
-- TABLE: Breakpoint
-- =====================================================
CREATE TABLE "Breakpoint" (
    id VARCHAR(200) PRIMARY KEY,
    "scriptId" VARCHAR(200) NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    condition TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "Breakpoint_scriptId_fkey" FOREIGN KEY ("scriptId") 
        REFERENCES "Script"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Breakpoint_scriptId_lineNumber_key" UNIQUE ("scriptId", "lineNumber")
);

CREATE INDEX "Breakpoint_scriptId_idx" ON "Breakpoint"("scriptId");

COMMENT ON TABLE "Breakpoint" IS 'Debugging breakpoints for script execution';

-- =====================================================
-- TABLE: TestSuite
-- =====================================================
CREATE TABLE "TestSuite" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestSuite_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestSuite_userId_idx" ON "TestSuite"("userId");

COMMENT ON TABLE "TestSuite" IS 'Test data suite collections';

-- =====================================================
-- TABLE: TestData
-- =====================================================
CREATE TABLE "TestData" (
    id VARCHAR(200) PRIMARY KEY,
    "suiteId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    environment VARCHAR(200) NOT NULL DEFAULT 'dev',
    type VARCHAR(200) NOT NULL DEFAULT 'user',
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestData_suiteId_fkey" FOREIGN KEY ("suiteId") 
        REFERENCES "TestSuite"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TestData_suiteId_idx" ON "TestData"("suiteId");
CREATE INDEX "TestData_environment_idx" ON "TestData"(environment);
CREATE INDEX "TestData_type_idx" ON "TestData"(type);

COMMENT ON TABLE "TestData" IS 'Generated test data records (boundary, equivalence, security tests)';
COMMENT ON COLUMN "TestData".type IS 'Data type: user, product, boundaryValue, equivalencePartition, securityTest';

-- =====================================================
-- TABLE: ApiRequest
-- =====================================================
CREATE TABLE "ApiRequest" (
    id VARCHAR(200) PRIMARY KEY,
    "userId" VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    method VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB,
    body JSONB,
    environment VARCHAR(200) NOT NULL DEFAULT 'dev',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ApiRequest_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ApiRequest_userId_idx" ON "ApiRequest"("userId");
CREATE INDEX "ApiRequest_environment_idx" ON "ApiRequest"(environment);

COMMENT ON TABLE "ApiRequest" IS 'Saved API requests for testing';

-- =====================================================
-- TABLE: ExternalAPIConfig
-- =====================================================
CREATE TABLE "ExternalAPIConfig" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "apiType" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'POST',
    headers JSONB,
    "authType" VARCHAR(50),
    "authConfig" JSONB,
    "requestTemplate" JSONB,
    "responseMapping" JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ExternalAPIConfig_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ExternalAPIConfig_userId_idx" ON "ExternalAPIConfig"("userId");
CREATE INDEX "ExternalAPIConfig_apiType_idx" ON "ExternalAPIConfig"("apiType");

COMMENT ON TABLE "ExternalAPIConfig" IS 'External API integration configurations';

-- =====================================================
-- TABLE: APICallLog
-- =====================================================
CREATE TABLE "APICallLog" (
    id VARCHAR(200) PRIMARY KEY,
    "configId" VARCHAR(200) NOT NULL,
    "userId" VARCHAR(200) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    "requestBody" JSONB,
    "responseBody" JSONB,
    "statusCode" INTEGER,
    duration INTEGER,
    success BOOLEAN NOT NULL DEFAULT false,
    error TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "APICallLog_configId_fkey" FOREIGN KEY ("configId")
        REFERENCES "ExternalAPIConfig"(id) ON DELETE CASCADE,
    CONSTRAINT "APICallLog_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "APICallLog_configId_idx" ON "APICallLog"("configId");
CREATE INDEX "APICallLog_userId_idx" ON "APICallLog"("userId");
CREATE INDEX "APICallLog_createdAt_idx" ON "APICallLog"("createdAt");

COMMENT ON TABLE "APICallLog" IS 'Audit log for external API calls';

-- =====================================================
-- TABLE: TestDataset
-- =====================================================
CREATE TABLE "TestDataset" (
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    "dataType" VARCHAR(200) NOT NULL,
    records JSONB NOT NULL DEFAULT '[]',
    schema JSONB,
    "userId" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "TestDataset_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "TestDataset_userId_idx" ON "TestDataset"("userId");
CREATE INDEX "TestDataset_dataType_idx" ON "TestDataset"("dataType");
CREATE INDEX "TestDataset_createdAt_idx" ON "TestDataset"("createdAt");

COMMENT ON TABLE "TestDataset" IS 'Pre-generated test datasets';

-- =====================================================
-- TEST DATA REPOSITORY TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS test_data_repositories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(200) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    source TEXT,
    config JSONB,
    row_count INTEGER DEFAULT 0,
    column_names JSONB,
    last_refreshed TIMESTAMP,
    auto_refresh BOOLEAN DEFAULT false,
    refresh_interval INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_data_repo_user ON test_data_repositories(user_id);
CREATE INDEX idx_test_data_repo_type ON test_data_repositories(data_type);

COMMENT ON TABLE test_data_repositories IS 'Test data repository configurations';

CREATE TABLE IF NOT EXISTS test_data_snapshots (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    snapshot_data JSONB NOT NULL,
    row_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(200) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX idx_snapshot_repo ON test_data_snapshots(repository_id);
CREATE INDEX idx_snapshot_created ON test_data_snapshots(created_at);

COMMENT ON TABLE test_data_snapshots IS 'Point-in-time snapshots of test data';

CREATE TABLE IF NOT EXISTS data_cleanup_rules (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cleanup_type VARCHAR(50) NOT NULL,
    schedule VARCHAR(100),
    query_template TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    last_executed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cleanup_repo ON data_cleanup_rules(repository_id);
CREATE INDEX idx_cleanup_enabled ON data_cleanup_rules(enabled);

COMMENT ON TABLE data_cleanup_rules IS 'Automated data cleanup rules';

CREATE TABLE IF NOT EXISTS synthetic_data_templates (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL REFERENCES test_data_repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    generator VARCHAR(100) NOT NULL,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_synthetic_repo ON synthetic_data_templates(repository_id);

COMMENT ON TABLE synthetic_data_templates IS 'Templates for synthetic test data generation';

-- =====================================================
-- API TESTING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS api_test_suites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(200) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    base_url VARCHAR(500),
    headers JSONB,
    auth_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_suite_user ON api_test_suites(user_id);

COMMENT ON TABLE api_test_suites IS 'API test suite collections';

CREATE TABLE IF NOT EXISTS api_test_cases (
    id SERIAL PRIMARY KEY,
    suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    headers JSONB,
    query_params JSONB,
    body TEXT,
    expected_status INTEGER,
    expected_response JSONB,
    assertions JSONB,
    timeout INTEGER DEFAULT 5000,
    retry_count INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_test_suite ON api_test_cases(suite_id);
CREATE INDEX idx_api_test_enabled ON api_test_cases(enabled);

COMMENT ON TABLE api_test_cases IS 'Individual API test cases';

CREATE TABLE IF NOT EXISTS api_contracts (
    id SERIAL PRIMARY KEY,
    suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    contract_data JSONB NOT NULL,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_suite ON api_contracts(suite_id);

COMMENT ON TABLE api_contracts IS 'API contract definitions for contract testing';

CREATE TABLE IF NOT EXISTS api_mocks (
    id SERIAL PRIMARY KEY,
    suite_id INTEGER NOT NULL REFERENCES api_test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_status INTEGER DEFAULT 200,
    response_headers JSONB,
    response_body TEXT,
    response_delay INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mock_suite ON api_mocks(suite_id);
CREATE INDEX idx_mock_enabled ON api_mocks(enabled);

COMMENT ON TABLE api_mocks IS 'API mock definitions for testing';

CREATE TABLE IF NOT EXISTS api_performance_benchmarks (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER NOT NULL REFERENCES api_test_cases(id) ON DELETE CASCADE,
    run_id VARCHAR(255) NOT NULL,
    response_time INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_msg TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_benchmark_test ON api_performance_benchmarks(test_case_id);
CREATE INDEX idx_benchmark_timestamp ON api_performance_benchmarks(timestamp);

COMMENT ON TABLE api_performance_benchmarks IS 'API performance benchmark results';

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updatedAt timestamp (camelCase)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at timestamp (snake_case)
CREATE OR REPLACE FUNCTION update_updated_at_snake()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updatedAt trigger to camelCase tables
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_updated_at ON "Project";
CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_script_updated_at ON "Script";
CREATE TRIGGER update_script_updated_at BEFORE UPDATE ON "Script"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_extension_script_updated_at ON "ExtensionScript";
CREATE TRIGGER update_extension_script_updated_at BEFORE UPDATE ON "ExtensionScript"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variable_updated_at ON "Variable";
CREATE TRIGGER update_variable_updated_at BEFORE UPDATE ON "Variable"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_suite_updated_at ON "TestSuite";
CREATE TRIGGER update_test_suite_updated_at BEFORE UPDATE ON "TestSuite"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_data_updated_at ON "TestData";
CREATE TRIGGER update_test_data_updated_at BEFORE UPDATE ON "TestData"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_request_updated_at ON "ApiRequest";
CREATE TRIGGER update_api_request_updated_at BEFORE UPDATE ON "ApiRequest"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_external_api_config_updated_at ON "ExternalAPIConfig";
CREATE TRIGGER update_external_api_config_updated_at BEFORE UPDATE ON "ExternalAPIConfig"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_dataset_updated_at ON "TestDataset";
CREATE TRIGGER update_test_dataset_updated_at BEFORE UPDATE ON "TestDataset"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply snake_case updated_at triggers
DROP TRIGGER IF EXISTS update_test_data_repo_updated_at ON test_data_repositories;
CREATE TRIGGER update_test_data_repo_updated_at BEFORE UPDATE ON test_data_repositories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_cleanup_rule_updated_at ON data_cleanup_rules;
CREATE TRIGGER update_cleanup_rule_updated_at BEFORE UPDATE ON data_cleanup_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_synthetic_template_updated_at ON synthetic_data_templates;
CREATE TRIGGER update_synthetic_template_updated_at BEFORE UPDATE ON synthetic_data_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_suite_updated_at ON api_test_suites;
CREATE TRIGGER update_api_suite_updated_at BEFORE UPDATE ON api_test_suites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_test_updated_at ON api_test_cases;
CREATE TRIGGER update_api_test_updated_at BEFORE UPDATE ON api_test_cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_contract_updated_at ON api_contracts;
CREATE TRIGGER update_api_contract_updated_at BEFORE UPDATE ON api_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

DROP TRIGGER IF EXISTS update_api_mock_updated_at ON api_mocks;
CREATE TRIGGER update_api_mock_updated_at BEFORE UPDATE ON api_mocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_snake();

-- =====================================================
-- VERIFICATION QUERIES (Run separately after migration)
-- =====================================================

-- Count all tables
-- SELECT 
--     schemaname,
--     tablename,
--     (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = tablename) as table_exists
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- List all indexes
-- SELECT 
--     schemaname,
--     tablename,
--     indexname
-- FROM pg_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Verify workflowStatus column exists
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'Script' AND column_name = 'workflowStatus';

-- Verify updatedAt columns exist
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE column_name IN ('updatedAt', 'updated_at') 
-- AND table_schema = 'public'
-- ORDER BY table_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration script includes:
-- ✓ All core tables (User, Project, Script, TestRun, etc.)
-- ✓ Test data management tables (TestSuite, TestData)
-- ✓ API testing tables (ApiRequest, ExternalAPIConfig, APICallLog)
-- ✓ Test data repository tables (with snake_case columns)
-- ✓ API testing suite tables (api_test_suites, api_test_cases, etc.)
-- ✓ workflowStatus column in Script table
-- ✓ updatedAt/updated_at columns in all relevant tables
-- ✓ Proper indexes for performance
-- ✓ Foreign key constraints with CASCADE
-- ✓ Automatic timestamp triggers
-- ✓ Table and column comments for documentation
-- =====================================================
