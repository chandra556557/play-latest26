-- Migration: Test Data File Import
-- Description: Add table for importing CSV/JSON test data files
-- Date: 2026-02-02

-- Create TestDataFile table
CREATE TABLE IF NOT EXISTS "TestDataFile" (
    id UUID PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "fileName" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(10) NOT NULL CHECK ("fileType" IN ('csv', 'json')),
    environment VARCHAR(50) DEFAULT 'dev',
    "recordCount" INTEGER DEFAULT 0,
    data JSONB NOT NULL,
    "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_file_type CHECK ("fileType" IN ('csv', 'json'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testdatafile_userId ON "TestDataFile"("userId");
CREATE INDEX IF NOT EXISTS idx_testdatafile_fileType ON "TestDataFile"("fileType");
