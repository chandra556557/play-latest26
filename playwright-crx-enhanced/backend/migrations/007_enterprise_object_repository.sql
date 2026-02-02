-- =====================================================
-- Enterprise Object Repository Enhancements
-- Version: 2.0.0
-- Description: Add enterprise features for production use
-- =====================================================

-- =====================================================
-- 1. VERSION CONTROL - Element Change History
-- =====================================================
CREATE TABLE IF NOT EXISTS element_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Version tracking
    version_number INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'restored'
    
    -- Snapshot of element data at this version
    element_snapshot JSONB NOT NULL,
    
    -- Change details
    changed_fields TEXT[],
    change_reason TEXT,
    
    -- Audit trail
    changed_by VARCHAR(200),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    is_current_version BOOLEAN DEFAULT false,
    
    CONSTRAINT unique_element_version UNIQUE (element_id, version_number)
);

CREATE INDEX idx_element_versions_element ON element_versions(element_id);
CREATE INDEX idx_element_versions_current ON element_versions(is_current_version) WHERE is_current_version = true;
CREATE INDEX idx_element_versions_date ON element_versions(changed_at DESC);

-- =====================================================
-- 2. APPROVAL WORKFLOW - Multi-stage approval
-- =====================================================
CREATE TABLE IF NOT EXISTS element_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    version_id UUID REFERENCES element_versions(id) ON DELETE CASCADE,
    
    -- Approval workflow
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'draft'
    approval_stage VARCHAR(50) NOT NULL, -- 'qa', 'lead', 'manager', 'admin'
    
    -- Approver details
    requester_id VARCHAR(200) NOT NULL,
    approver_id VARCHAR(200),
    
    -- Approval metadata
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Priority and classification
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    impact_level VARCHAR(20) DEFAULT 'minor' -- 'minor', 'moderate', 'major', 'breaking'
);

CREATE INDEX idx_element_approvals_status ON element_approvals(approval_status);
CREATE INDEX idx_element_approvals_element ON element_approvals(element_id);
CREATE INDEX idx_element_approvals_requester ON element_approvals(requester_id);

-- =====================================================
-- 3. ENVIRONMENT MANAGEMENT - Multi-environment support
-- =====================================================
CREATE TABLE IF NOT EXISTS element_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Environment details
    environment VARCHAR(50) NOT NULL, -- 'dev', 'staging', 'qa', 'uat', 'prod'
    
    -- Environment-specific selectors
    selector_overrides JSONB DEFAULT '{}',
    url_override TEXT,
    
    -- Validation
    is_validated BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_status VARCHAR(50), -- 'pass', 'fail', 'pending'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_element_environment UNIQUE (element_id, environment)
);

CREATE INDEX idx_element_environments_element ON element_environments(element_id);
CREATE INDEX idx_element_environments_env ON element_environments(environment);

-- =====================================================
-- 4. TAGS & CATEGORIZATION - Enhanced organization
-- =====================================================
CREATE TABLE IF NOT EXISTS element_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Tag details
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50), -- 'feature', 'module', 'priority', 'type', 'custom'
    tag_color VARCHAR(7), -- Hex color code
    
    -- Metadata
    created_by VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_element_tags_element ON element_tags(element_id);
CREATE INDEX idx_element_tags_name ON element_tags(tag_name);
CREATE INDEX idx_element_tags_category ON element_tags(tag_category);

-- =====================================================
-- 5. DEPENDENCIES & RELATIONSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS element_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    dependent_element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Dependency details
    dependency_type VARCHAR(50) NOT NULL, -- 'contains', 'precedes', 'blocks', 'enables'
    description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_dependency CHECK (parent_element_id != dependent_element_id),
    CONSTRAINT unique_dependency UNIQUE (parent_element_id, dependent_element_id, dependency_type)
);

CREATE INDEX idx_element_dependencies_parent ON element_dependencies(parent_element_id);
CREATE INDEX idx_element_dependencies_dependent ON element_dependencies(dependent_element_id);

-- =====================================================
-- 6. PERFORMANCE METRICS & RELIABILITY
-- =====================================================
CREATE TABLE IF NOT EXISTS element_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES ui_elements(id) ON DELETE CASCADE,
    
    -- Performance metrics
    avg_load_time_ms INTEGER,
    success_rate DECIMAL(5, 2), -- Percentage
    failure_count INTEGER DEFAULT 0,
    
    -- Reliability metrics
    last_successful_use TIMESTAMP WITH TIME ZONE,
    last_failure_use TIMESTAMP WITH TIME ZONE,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Health score (0-100)
    health_score INTEGER DEFAULT 100,
    
    -- Time period
    metric_period VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_element_metrics_element ON element_metrics(element_id);
CREATE INDEX idx_element_metrics_health ON element_metrics(health_score);
CREATE INDEX idx_element_metrics_period ON element_metrics(period_start, period_end);

-- =====================================================
-- 7. AUDIT LOG - Comprehensive tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Resource tracking
    resource_type VARCHAR(50) NOT NULL, -- 'page', 'element', 'setting', 'approval'
    resource_id UUID NOT NULL,
    
    -- Action tracking
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'restore'
    
    -- Change details
    old_value JSONB,
    new_value JSONB,
    changed_fields TEXT[],
    
    -- User context
    user_id VARCHAR(200) NOT NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Request context
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action_reason TEXT,
    
    -- Compliance
    is_compliance_relevant BOOLEAN DEFAULT false,
    retention_period_days INTEGER DEFAULT 365
);

CREATE INDEX idx_audit_log_resource ON repository_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_user ON repository_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON repository_audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON repository_audit_log(action_timestamp DESC);

-- =====================================================
-- 8. BACKUP & RECOVERY
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Backup metadata
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'manual', 'scheduled'
    backup_scope VARCHAR(50) NOT NULL, -- 'project', 'page', 'all'
    scope_id VARCHAR(200),
    
    -- Backup data
    backup_data JSONB NOT NULL,
    compressed_size_bytes BIGINT,
    
    -- Backup status
    backup_status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    
    -- Metadata
    created_by VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Recovery info
    can_be_restored BOOLEAN DEFAULT true,
    restore_count INTEGER DEFAULT 0,
    last_restored_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_backups_type ON repository_backups(backup_type);
CREATE INDEX idx_backups_scope ON repository_backups(backup_scope, scope_id);
CREATE INDEX idx_backups_created ON repository_backups(created_at DESC);

-- =====================================================
-- 9. NOTIFICATIONS & ALERTS
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL, -- 'element_broken', 'approval_needed', 'health_degraded', 'dependency_broken'
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
    
    -- Subject
    subject_type VARCHAR(50) NOT NULL, -- 'element', 'page', 'approval'
    subject_id UUID NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Recipients
    recipient_id VARCHAR(200),
    recipient_email VARCHAR(255),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_recipient ON repository_notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_subject ON repository_notifications(subject_type, subject_id);
CREATE INDEX idx_notifications_created ON repository_notifications(created_at DESC);

-- =====================================================
-- 10. ANALYTICS & REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Analytics scope
    analytics_type VARCHAR(50) NOT NULL, -- 'usage', 'health', 'performance', 'coverage'
    scope_type VARCHAR(50) NOT NULL, -- 'global', 'project', 'page', 'element'
    scope_id VARCHAR(200),
    
    -- Metrics
    metrics_data JSONB NOT NULL,
    
    -- Time period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(200)
);

CREATE INDEX idx_analytics_type ON repository_analytics(analytics_type);
CREATE INDEX idx_analytics_scope ON repository_analytics(scope_type, scope_id);
CREATE INDEX idx_analytics_period ON repository_analytics(period_start, period_end);

-- =====================================================
-- 11. Add enterprise columns to existing tables
-- =====================================================

-- Add to page_objects
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT false;
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS deprecation_reason TEXT;
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS replacement_page_id UUID REFERENCES page_objects(id);
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS owner_id VARCHAR(200);
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS team_id VARCHAR(200);
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE page_objects ADD COLUMN IF NOT EXISTS review_interval_days INTEGER DEFAULT 90;

-- Add to ui_elements
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT false;
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS deprecation_reason TEXT;
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS replacement_element_id UUID REFERENCES ui_elements(id);
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS owner_id VARCHAR(200);
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS business_value VARCHAR(20) DEFAULT 'medium'; -- 'low', 'medium', 'high', 'critical'
ALTER TABLE ui_elements ADD COLUMN IF NOT EXISTS maintenance_notes TEXT;

-- =====================================================
-- 12. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create version on element update
CREATE OR REPLACE FUNCTION create_element_version()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO element_versions (
        element_id,
        version_number,
        change_type,
        element_snapshot,
        changed_by,
        is_current_version
    ) VALUES (
        NEW.id,
        COALESCE((SELECT MAX(version_number) + 1 FROM element_versions WHERE element_id = NEW.id), 1),
        CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
        row_to_json(NEW),
        current_user,
        true
    );
    
    -- Mark previous version as not current
    UPDATE element_versions 
    SET is_current_version = false 
    WHERE element_id = NEW.id 
    AND id != (SELECT id FROM element_versions WHERE element_id = NEW.id ORDER BY version_number DESC LIMIT 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for element versioning
DROP TRIGGER IF EXISTS trigger_element_versioning ON ui_elements;
CREATE TRIGGER trigger_element_versioning
AFTER INSERT OR UPDATE ON ui_elements
FOR EACH ROW EXECUTE FUNCTION create_element_version();

-- Function to update element metrics
CREATE OR REPLACE FUNCTION update_element_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to existing tables
DROP TRIGGER IF EXISTS trigger_page_updated_at ON page_objects;
CREATE TRIGGER trigger_page_updated_at
BEFORE UPDATE ON page_objects
FOR EACH ROW EXECUTE FUNCTION update_element_updated_at();

DROP TRIGGER IF EXISTS trigger_element_updated_at ON ui_elements;
CREATE TRIGGER trigger_element_updated_at
BEFORE UPDATE ON ui_elements
FOR EACH ROW EXECUTE FUNCTION update_element_updated_at();

-- =====================================================
-- 13. VIEWS FOR REPORTING
-- =====================================================

-- Element health dashboard view
CREATE OR REPLACE VIEW v_element_health_dashboard AS
SELECT 
    e.id,
    e.name,
    e.display_name,
    p.name as page_name,
    e.is_healthy,
    m.health_score,
    m.success_rate,
    m.avg_load_time_ms,
    e.usage_count,
    e.last_used_at,
    CASE 
        WHEN m.health_score >= 90 THEN 'excellent'
        WHEN m.health_score >= 75 THEN 'good'
        WHEN m.health_score >= 50 THEN 'fair'
        ELSE 'poor'
    END as health_status
FROM ui_elements e
LEFT JOIN page_objects p ON e.page_object_id = p.id
LEFT JOIN (
    SELECT element_id, 
           AVG(health_score) as health_score,
           AVG(success_rate) as success_rate,
           AVG(avg_load_time_ms) as avg_load_time_ms
    FROM element_metrics 
    WHERE period_start >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY element_id
) m ON e.id = m.element_id;

-- Approval pending view
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    a.id as approval_id,
    e.id as element_id,
    e.name,
    e.display_name,
    p.name as page_name,
    a.approval_stage,
    a.priority,
    a.impact_level,
    a.requester_id,
    a.requested_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.requested_at))/3600 as pending_hours
FROM element_approvals a
JOIN ui_elements e ON a.element_id = e.id
LEFT JOIN page_objects p ON e.page_object_id = p.id
WHERE a.approval_status = 'pending'
ORDER BY a.priority DESC, a.requested_at ASC;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE element_versions IS 'Version control for UI elements with full change history';
COMMENT ON TABLE element_approvals IS 'Multi-stage approval workflow for element changes';
COMMENT ON TABLE element_environments IS 'Environment-specific element configurations';
COMMENT ON TABLE element_tags IS 'Flexible tagging system for element organization';
COMMENT ON TABLE element_dependencies IS 'Element relationships and dependencies';
COMMENT ON TABLE element_metrics IS 'Performance and reliability metrics per element';
COMMENT ON TABLE repository_audit_log IS 'Comprehensive audit trail for all repository changes';
COMMENT ON TABLE repository_backups IS 'Backup and recovery management';
COMMENT ON TABLE repository_notifications IS 'Alert and notification system';
COMMENT ON TABLE repository_analytics IS 'Analytics and reporting data';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Enterprise Object Repository features installed successfully!';
    RAISE NOTICE '📊 Added features: Versioning, Approvals, Multi-env, Tags, Dependencies, Metrics, Audit, Backups, Notifications, Analytics';
END $$;
