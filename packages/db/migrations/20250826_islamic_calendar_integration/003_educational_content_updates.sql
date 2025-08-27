-- Educational Content Updates for Islamic Calendar Integration
-- Enhances existing educational_content table with calendar-aware features

-- Add Islamic calendar fields to educational_content table
ALTER TABLE educational_content 
ADD COLUMN IF NOT EXISTS hijri_month INTEGER CHECK (hijri_month >= 1 AND hijri_month <= 12),
ADD COLUMN IF NOT EXISTS hijri_season VARCHAR(50), -- 'SPRING', 'SUMMER', 'FALL', 'WINTER'
ADD COLUMN IF NOT EXISTS islamic_event_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS seasonal_relevance VARCHAR(100),
ADD COLUMN IF NOT EXISTS calendar_priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS event_specific BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cultural_context VARCHAR(100) DEFAULT 'american_muslim',
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[],
ADD COLUMN IF NOT EXISTS recommended_activities TEXT[];

-- Create Islamic Calendar Content Mapping Table
CREATE TABLE IF NOT EXISTS islamic_calendar_content_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    islamic_event_id UUID NOT NULL REFERENCES islamic_events(id) ON DELETE CASCADE,
    
    -- Relationship Information
    relevance_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00
    mapping_type VARCHAR(50) DEFAULT 'DIRECT', -- 'DIRECT', 'RELATED', 'PREPARATORY', 'FOLLOW_UP'
    
    -- Educational Context
    learning_context VARCHAR(100), -- 'PRE_EVENT', 'DURING_EVENT', 'POST_EVENT', 'YEAR_ROUND'
    teaching_phase VARCHAR(50), -- 'INTRODUCTION', 'EXPLORATION', 'APPLICATION', 'REFLECTION'
    
    -- Age-Specific Adaptations
    age_specific_notes TEXT,
    cultural_adaptations JSONB DEFAULT '{}',
    
    -- Usage Guidelines
    recommended_usage TEXT,
    prerequisites TEXT[],
    follow_up_activities TEXT[],
    
    -- Quality and Effectiveness
    usage_frequency INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,2),
    teacher_feedback JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(content_id, islamic_event_id),
    CONSTRAINT valid_relevance_score CHECK (relevance_score >= 0.00 AND relevance_score <= 1.00),
    CONSTRAINT valid_effectiveness CHECK (effectiveness_rating IS NULL OR (effectiveness_rating >= 0.00 AND effectiveness_rating <= 5.00))
);

-- Seasonal Educational Content Table
CREATE TABLE IF NOT EXISTS seasonal_educational_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Theme Information
    theme_name VARCHAR(255) NOT NULL,
    theme_description TEXT,
    theme_category VARCHAR(100), -- 'WORSHIP', 'HISTORY', 'MORALS', 'COMMUNITY', 'SPIRITUALITY'
    
    -- Seasonal Association
    hijri_month INTEGER NOT NULL CHECK (hijri_month >= 1 AND hijri_month <= 12),
    gregorian_season VARCHAR(20), -- 'SPRING', 'SUMMER', 'FALL', 'WINTER'
    
    -- Age Tier Specifications
    age_tier VARCHAR(20) NOT NULL,
    complexity_level VARCHAR(20) DEFAULT 'INTERMEDIATE',
    
    -- Learning Framework
    core_concepts TEXT[] NOT NULL,
    essential_questions TEXT[],
    learning_outcomes TEXT[],
    assessment_methods TEXT[],
    
    -- Cultural Integration
    american_muslim_context TEXT,
    interfaith_considerations TEXT,
    community_connections TEXT[],
    
    -- Instructional Design
    suggested_duration_weeks INTEGER DEFAULT 2,
    recommended_frequency VARCHAR(20) DEFAULT 'WEEKLY', -- 'DAILY', 'WEEKLY', 'BIWEEKLY'
    prerequisite_knowledge TEXT[],
    
    -- Resource Requirements
    required_materials TEXT[],
    technology_needs TEXT[],
    space_requirements VARCHAR(255),
    
    -- Differentiation Strategies
    visual_learners_adaptations TEXT[],
    auditory_learners_adaptations TEXT[],
    kinesthetic_learners_adaptations TEXT[],
    special_needs_accommodations TEXT[],
    
    -- Assessment and Evaluation
    formative_assessments TEXT[],
    summative_assessments TEXT[],
    reflection_activities TEXT[],
    
    -- Family and Community Engagement
    parent_involvement_opportunities TEXT[],
    community_service_connections TEXT[],
    home_extension_activities TEXT[],
    
    -- Digital Integration
    online_resources JSONB DEFAULT '[]',
    multimedia_requirements TEXT[],
    interactive_components TEXT[],
    
    -- Quality Assurance
    approval_status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'NEEDS_REVISION'
    curriculum_alignment VARCHAR(255),
    standards_alignment TEXT[],
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    feedback_summary JSONB DEFAULT '{}',
    effectiveness_metrics JSONB DEFAULT '{}',
    
    -- Versioning and Maintenance
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    last_reviewed_date DATE,
    next_review_date DATE,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Content Calendar Template Table
CREATE TABLE IF NOT EXISTS content_calendar_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_type VARCHAR(50) DEFAULT 'YEARLY', -- 'MONTHLY', 'SEASONAL', 'YEARLY', 'EVENT_BASED'
    
    -- Target Audience
    target_age_tier VARCHAR(20) NOT NULL,
    target_group_size VARCHAR(20), -- 'INDIVIDUAL', 'SMALL_GROUP', 'LARGE_GROUP', 'FAMILY'
    learning_environment VARCHAR(50), -- 'CLASSROOM', 'HOME', 'COMMUNITY', 'ONLINE', 'HYBRID'
    
    -- Calendar Structure
    hijri_year_template BOOLEAN DEFAULT true,
    gregorian_alignment BOOLEAN DEFAULT true,
    total_duration_months INTEGER DEFAULT 12,
    
    -- Content Organization
    monthly_themes JSONB NOT NULL DEFAULT '{}', -- Key: month number, Value: theme data
    weekly_breakdown JSONB DEFAULT '{}',
    daily_activities JSONB DEFAULT '{}',
    
    -- Educational Framework
    curriculum_goals TEXT[],
    assessment_strategies TEXT[],
    differentiation_approaches TEXT[],
    
    -- Islamic Integration
    quran_verses_monthly JSONB DEFAULT '{}',
    hadith_monthly JSONB DEFAULT '{}',
    duas_monthly JSONB DEFAULT '{}',
    islamic_practices JSONB DEFAULT '{}',
    
    -- Cultural Adaptation
    american_context_notes TEXT,
    multicultural_considerations TEXT,
    local_community_connections TEXT[],
    
    -- Resource Planning
    required_materials_monthly JSONB DEFAULT '{}',
    recommended_field_trips JSONB DEFAULT '{}',
    guest_speaker_opportunities JSONB DEFAULT '{}',
    
    -- Family Engagement
    parent_communication_schedule JSONB DEFAULT '{}',
    home_activities_monthly JSONB DEFAULT '{}',
    family_events JSONB DEFAULT '{}',
    
    -- Quality and Standards
    educational_standards_alignment TEXT[],
    islamic_educational_principles TEXT[],
    assessment_rubrics JSONB DEFAULT '{}',
    
    -- Implementation Support
    teacher_preparation_notes TEXT,
    implementation_timeline JSONB DEFAULT '{}',
    troubleshooting_guide TEXT[],
    
    -- Usage and Feedback
    usage_statistics JSONB DEFAULT '{}',
    user_feedback JSONB DEFAULT '[]',
    effectiveness_metrics JSONB DEFAULT '{}',
    
    -- Administrative
    approval_required BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approval_date DATE,
    
    -- Status and Maintenance
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    maintenance_schedule VARCHAR(50) DEFAULT 'ANNUALLY',
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id)
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_islamic_calendar_content_mapping_content ON islamic_calendar_content_mapping(content_id);
CREATE INDEX IF NOT EXISTS idx_islamic_calendar_content_mapping_event ON islamic_calendar_content_mapping(islamic_event_id);
CREATE INDEX IF NOT EXISTS idx_islamic_calendar_content_mapping_relevance ON islamic_calendar_content_mapping(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_islamic_calendar_content_mapping_type ON islamic_calendar_content_mapping(mapping_type);

CREATE INDEX IF NOT EXISTS idx_seasonal_themes_month ON seasonal_educational_themes(hijri_month);
CREATE INDEX IF NOT EXISTS idx_seasonal_themes_age_tier ON seasonal_educational_themes(age_tier);
CREATE INDEX IF NOT EXISTS idx_seasonal_themes_active ON seasonal_educational_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_seasonal_themes_approval ON seasonal_educational_themes(approval_status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_age_tier ON content_calendar_templates(target_age_tier);
CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_type ON content_calendar_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_public ON content_calendar_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_active ON content_calendar_templates(is_active);

-- Create indexes for enhanced educational_content fields
CREATE INDEX IF NOT EXISTS idx_educational_content_hijri_month ON educational_content(hijri_month);
CREATE INDEX IF NOT EXISTS idx_educational_content_event_tags ON educational_content USING gin(islamic_event_tags);
CREATE INDEX IF NOT EXISTS idx_educational_content_seasonal ON educational_content(seasonal_relevance);
CREATE INDEX IF NOT EXISTS idx_educational_content_calendar_priority ON educational_content(calendar_priority DESC);
CREATE INDEX IF NOT EXISTS idx_educational_content_event_specific ON educational_content(event_specific);

-- Insert sample seasonal educational themes
INSERT INTO seasonal_educational_themes (
    theme_name, theme_description, theme_category, hijri_month, age_tier,
    core_concepts, essential_questions, learning_outcomes,
    american_muslim_context, suggested_duration_weeks,
    created_by
) VALUES
(
    'New Beginnings and Reflection', 
    'Exploring the concept of new beginnings in Islamic tradition during Muharram',
    'SPIRITUALITY', 1, 'ELEMENTARY',
    ARRAY['Islamic New Year', 'Self-reflection', 'Goal setting', 'Gratitude'],
    ARRAY['Why do Muslims have a different new year?', 'How can we make positive changes?', 'What does it mean to reflect on our actions?'],
    ARRAY['Understand the Islamic calendar', 'Practice self-reflection', 'Set meaningful goals', 'Express gratitude'],
    'Help students understand dual calendar systems and make resolutions aligned with Islamic values',
    2,
    (SELECT id FROM users WHERE email = 'system@attaqwa.org' LIMIT 1)
),
(
    'The Greatest Role Model', 
    'Learning about Prophet Muhammad (PBUH) as the perfect example for Muslims',
    'HISTORY', 3, 'MIDDLE_SCHOOL',
    ARRAY['Prophetic biography', 'Character traits', 'Leadership', 'Compassion'],
    ARRAY['What made Prophet Muhammad special?', 'How can we follow his example today?', 'What leadership qualities did he show?'],
    ARRAY['Know key events in Prophet''s life', 'Identify prophetic character traits', 'Apply teachings to modern situations'],
    'Present Prophet Muhammad as a universal role model while respecting diverse backgrounds',
    3,
    (SELECT id FROM users WHERE email = 'system@attaqwa.org' LIMIT 1)
),
(
    'Ramadan: A Month of Growth', 
    'Comprehensive exploration of Ramadan''s spiritual, physical, and social dimensions',
    'WORSHIP', 9, 'HIGH_SCHOOL',
    ARRAY['Fasting wisdom', 'Spiritual development', 'Community service', 'Self-discipline'],
    ARRAY['Why do Muslims fast?', 'How does fasting help us grow?', 'What is our responsibility to others?'],
    ARRAY['Understand fasting benefits', 'Develop self-discipline', 'Engage in community service', 'Strengthen spiritual practices'],
    'Address common questions about fasting while emphasizing universal values of self-control and empathy',
    4,
    (SELECT id FROM users WHERE email = 'system@attaqwa.org' LIMIT 1)
);

-- Update triggers for new tables
CREATE OR REPLACE FUNCTION update_seasonal_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seasonal_themes_updated_at
    BEFORE UPDATE ON seasonal_educational_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_seasonal_themes_updated_at();

CREATE OR REPLACE FUNCTION update_calendar_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_calendar_templates_updated_at
    BEFORE UPDATE ON content_calendar_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_templates_updated_at();