-- =====================================================
-- Object Repository Database Schema
-- Version: 1.0.0
-- Description: Centralized element repository with Page Object Model support
-- =====================================================

-- =====================================================
-- 1. Page Objects Table
-- =====================================================
CREATE TABLE IF NOT EXISTS page_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- URL matching
    url TEXT NOT NULL,
    url_pattern TEXT,
    
    -- Page metadata
    project_id VARCHAR(200) REFERENCES "Project"(id) ON DELETE CASCADE,
    
    -- Code generation settings
    code_language VARCHAR(50) DEFAULT 'typescript',
    namespace VARCHAR(255),
    
    -- Usage tracking
    test_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_page_name_per_project UNIQUE (name, project_id)
);

CREATE INDEX idx_page_objects_project ON page_objects(project_id);
CREATE INDEX idx_page_objects_name ON page_objects(name);
CREATE INDEX idx_page_objects_url ON page_objects(url);

-- =====================================================
-- 2. UI Elements Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ui_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Page context
    page_object_id UUID REFERENCES page_objects(id) ON DELETE CASCADE,
    
    -- Element metadata
    category VARCHAR(50) NOT NULL DEFAULT 'custom',
    tag_name VARCHAR(100),
    attributes JSONB DEFAULT '{}',
    
    -- Visual info
    xpath TEXT,
    css_selector TEXT,
    
    -- Context
    url TEXT,
    screenshot_path TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Self-healing
    is_healthy BOOLEAN DEFAULT true,
    
    -- Indexes
    CONSTRAINT unique_element_name_per_page UNIQUE (name, page_object_id)
);

CREATE INDEX idx_ui_elements_page_object ON ui_elements(page_object_id);
CREATE INDEX idx_ui_elements_name ON ui_elements(name);
CREATE INDEX idx_ui_elements_category ON ui_elements(category);
CREATE INDEX idx_ui_elements_healthy ON ui_elements(is_healthy);
CREATE INDEX idx_ui_elements_usage ON ui_elements(usage_count DESC);

-- =====================================================
-- 3. Element Locators Table
-- =====================================================
CREATE TABLE IF NOT EXISTS element_locators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Locator details
    type VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence >= 0 AND confidence <= 1),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    
    -- Validation
    last_validated TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_locator_per_element UNIQUE (element_id, type, value)
);

CREATE INDEX idx_element_locators_element ON element_locators(element_id);
CREATE INDEX idx_element_locators_type ON element_locators(type);
CREATE INDEX idx_element_locators_active ON element_locators(is_active);
CREATE INDEX idx_element_locators_primary ON element_locators(is_primary);

-- =====================================================
-- 4. Healing History Table
-- =====================================================
CREATE TABLE IF NOT EXISTS healing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Healing details
    old_locator_type VARCHAR(50) NOT NULL,
    old_locator_value TEXT NOT NULL,
    new_locator_type VARCHAR(50) NOT NULL,
    new_locator_value TEXT NOT NULL,
    
    -- Healing metadata
    reason TEXT,
    auto_applied BOOLEAN DEFAULT false,
    confidence DECIMAL(3,2),
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT fk_element_healing FOREIGN KEY (element_id) REFERENCES ui_elements(id)
);

CREATE INDEX idx_healing_history_element ON healing_history(element_id);
CREATE INDEX idx_healing_history_timestamp ON healing_history(timestamp DESC);

-- =====================================================
-- 5. Object Repository Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(200) REFERENCES "Project"(id) ON DELETE CASCADE UNIQUE,
    
    -- Locator preferences (stored as JSON array)
    preferred_locator_order JSONB DEFAULT '["testId", "id", "css", "xpath", "text", "role"]',
    
    -- Naming conventions
    naming_convention VARCHAR(50) DEFAULT 'camelCase',
    
    -- Code generation
    default_language VARCHAR(50) DEFAULT 'typescript',
    default_framework VARCHAR(50) DEFAULT 'playwright',
    
    -- Self-healing
    auto_healing_enabled BOOLEAN DEFAULT true,
    auto_healing_threshold DECIMAL(3,2) DEFAULT 0.80,
    
    -- Version control
    versioning BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_repository_settings_project ON repository_settings(project_id);

-- =====================================================
-- 6. Element Tags Table (for categorization)
-- =====================================================
CREATE TABLE IF NOT EXISTS element_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_tag_per_element UNIQUE (element_id, tag)
);

CREATE INDEX idx_element_tags_element ON element_tags(element_id);
CREATE INDEX idx_element_tags_tag ON element_tags(tag);

-- =====================================================
-- 7. Element Usage Tracking Table
-- =====================================================
CREATE TABLE IF NOT EXISTS element_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    test_run_id VARCHAR(200) REFERENCES "TestRun"(id) ON DELETE CASCADE,
    
    -- Usage details
    action VARCHAR(100),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamps
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_element_usage_element ON element_usage(element_id);
CREATE INDEX idx_element_usage_test_run ON element_usage(test_run_id);
CREATE INDEX idx_element_usage_timestamp ON element_usage(used_at DESC);

-- =====================================================
-- 8. Update Triggers
-- =====================================================

-- Trigger to update updated_at timestamp for page_objects
CREATE OR REPLACE FUNCTION update_page_objects_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_page_objects_timestamp
    BEFORE UPDATE ON page_objects
    FOR EACH ROW
    EXECUTE FUNCTION update_page_objects_timestamp();

-- Trigger to update updated_at timestamp for ui_elements
CREATE OR REPLACE FUNCTION update_ui_elements_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ui_elements_timestamp
    BEFORE UPDATE ON ui_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_ui_elements_timestamp();

-- Trigger to update updated_at timestamp for element_locators
CREATE OR REPLACE FUNCTION update_element_locators_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_element_locators_timestamp
    BEFORE UPDATE ON element_locators
    FOR EACH ROW
    EXECUTE FUNCTION update_element_locators_timestamp();

-- =====================================================
-- 9. Ensure only one primary locator per element
-- =====================================================
CREATE OR REPLACE FUNCTION ensure_single_primary_locator()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Unset other primary locators for this element
        UPDATE element_locators
        SET is_primary = false
        WHERE element_id = NEW.element_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_locator
    BEFORE INSERT OR UPDATE ON element_locators
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION ensure_single_primary_locator();

-- =====================================================
-- 10. Sample Data (Optional - for development)
-- =====================================================

-- Insert default repository settings for existing projects
INSERT INTO repository_settings (project_id)
SELECT id FROM "Project"
WHERE NOT EXISTS (
    SELECT 1 FROM repository_settings WHERE project_id = "Project".id
);

-- =====================================================
-- 11. Views for Reporting
-- =====================================================

-- View: Element health status summary
CREATE OR REPLACE VIEW element_health_summary AS
SELECT 
    po.id as page_object_id,
    po.name as page_name,
    COUNT(ue.id) as total_elements,
    SUM(CASE WHEN ue.is_healthy = true THEN 1 ELSE 0 END) as healthy_elements,
    SUM(CASE WHEN ue.is_healthy = false THEN 1 ELSE 0 END) as unhealthy_elements,
    ROUND(AVG(CASE WHEN ue.is_healthy = true THEN 100 ELSE 0 END), 2) as health_percentage
FROM page_objects po
LEFT JOIN ui_elements ue ON ue.page_object_id = po.id
GROUP BY po.id, po.name;

-- View: Most used elements
CREATE OR REPLACE VIEW most_used_elements AS
SELECT 
    ue.id,
    ue.name,
    ue.display_name,
    ue.category,
    po.name as page_name,
    ue.usage_count,
    ue.last_used_at
FROM ui_elements ue
JOIN page_objects po ON ue.page_object_id = po.id
ORDER BY ue.usage_count DESC, ue.last_used_at DESC
LIMIT 50;

-- View: Recently healed elements
CREATE OR REPLACE VIEW recently_healed_elements AS
SELECT 
    ue.id as element_id,
    ue.name as element_name,
    po.name as page_name,
    hh.old_locator_type,
    hh.old_locator_value,
    hh.new_locator_type,
    hh.new_locator_value,
    hh.reason,
    hh.auto_applied,
    hh.timestamp
FROM healing_history hh
JOIN ui_elements ue ON hh.element_id = ue.id
JOIN page_objects po ON ue.page_object_id = po.id
ORDER BY hh.timestamp DESC
LIMIT 100;

-- =====================================================
-- Completion Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Object Repository schema created successfully!';
    RAISE NOTICE '📦 Tables created: page_objects, ui_elements, element_locators, healing_history';
    RAISE NOTICE '📊 Views created: element_health_summary, most_used_elements, recently_healed_elements';
    RAISE NOTICE '🔧 Triggers created: timestamp updates, primary locator enforcement';
END $$;
