-- Learning Plans Table
-- Stores personalized Islamic learning plans based on Islamic calendar

CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) DEFAULT 'ISLAMIC_CALENDAR', -- 'ISLAMIC_CALENDAR', 'CUSTOM', 'CURRICULUM_BASED'
    
    -- Duration and Scheduling
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_months INTEGER,
    
    -- Islamic Calendar Integration
    start_hijri_month INTEGER CHECK (start_hijri_month >= 1 AND start_hijri_month <= 12),
    start_hijri_year INTEGER,
    hijri_calendar_based BOOLEAN DEFAULT true,
    
    -- Plan Structure
    plan_data JSONB NOT NULL DEFAULT '{}', -- Detailed plan structure
    monthly_breakdown JSONB DEFAULT '[]', -- Month-by-month breakdown
    
    -- Progress Tracking
    total_content_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    estimated_hours INTEGER DEFAULT 0,
    actual_hours INTEGER DEFAULT 0,
    
    -- Learning Configuration
    intensity VARCHAR(20) DEFAULT 'MODERATE', -- 'LIGHT', 'MODERATE', 'INTENSIVE'
    focus_areas JSONB DEFAULT '[]', -- Array of IslamicSubject values
    preferred_learning_style VARCHAR(50), -- 'VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING'
    
    -- Personalization
    age_tier VARCHAR(20) NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'BEGINNER', -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
    language_preference VARCHAR(10) DEFAULT 'en',
    
    -- Status and Progress
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_week INTEGER DEFAULT 1,
    current_milestone VARCHAR(255),
    
    -- Adaptive Learning
    learning_pace VARCHAR(20) DEFAULT 'NORMAL', -- 'SLOW', 'NORMAL', 'FAST'
    adaptation_data JSONB DEFAULT '{}', -- AI-driven personalization data
    performance_metrics JSONB DEFAULT '{}',
    
    -- Reminders and Notifications
    reminder_frequency VARCHAR(20) DEFAULT 'WEEKLY', -- 'DAILY', 'WEEKLY', 'BIWEEKLY'
    notification_preferences JSONB DEFAULT '{}',
    
    -- Community Features
    is_shared BOOLEAN DEFAULT false,
    sharing_permissions VARCHAR(20) DEFAULT 'PRIVATE', -- 'PRIVATE', 'FAMILY', 'COMMUNITY', 'PUBLIC'
    study_group_id UUID,
    
    -- Review and Feedback
    teacher_id UUID REFERENCES users(id),
    parent_approval_required BOOLEAN DEFAULT false,
    feedback_data JSONB DEFAULT '{}',
    
    -- Quality and Effectiveness
    success_metrics JSONB DEFAULT '{}',
    user_satisfaction DECIMAL(3,2), -- 1.00 to 5.00 rating
    effectiveness_score DECIMAL(3,2),
    
    -- Audit and History
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_completion CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT valid_satisfaction CHECK (user_satisfaction IS NULL OR (user_satisfaction >= 1.0 AND user_satisfaction <= 5.0))
);

-- Learning Plan Milestones Table
CREATE TABLE IF NOT EXISTS learning_plan_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
    
    -- Milestone Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type VARCHAR(50) DEFAULT 'WEEKLY', -- 'DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'EVENT_BASED'
    
    -- Scheduling
    target_date DATE,
    hijri_month INTEGER,
    hijri_week INTEGER,
    sequence_order INTEGER,
    
    -- Associated Content
    content_ids JSONB DEFAULT '[]',
    quiz_ids JSONB DEFAULT '[]',
    activity_ids JSONB DEFAULT '[]',
    
    -- Requirements and Prerequisites
    prerequisites JSONB DEFAULT '[]',
    estimated_hours INTEGER DEFAULT 0,
    difficulty_level VARCHAR(20),
    
    -- Progress Tracking
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'
    completion_date DATE,
    actual_hours INTEGER DEFAULT 0,
    completion_score DECIMAL(5,2),
    
    -- Islamic Calendar Integration
    islamic_event_connection VARCHAR(100),
    seasonal_relevance VARCHAR(50),
    cultural_context VARCHAR(100) DEFAULT 'american_muslim',
    
    -- Assessment and Feedback
    assessment_required BOOLEAN DEFAULT false,
    assessment_type VARCHAR(50), -- 'QUIZ', 'PROJECT', 'PRESENTATION', 'PRACTICAL'
    minimum_score DECIMAL(5,2) DEFAULT 70.00,
    
    -- Adaptive Features
    difficulty_adjustment DECIMAL(3,2) DEFAULT 1.00, -- Multiplier for content difficulty
    personalization_data JSONB DEFAULT '{}',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_by UUID REFERENCES users(id),
    
    -- Ordering and Structure
    parent_milestone_id UUID REFERENCES learning_plan_milestones(id),
    is_required BOOLEAN DEFAULT true,
    weight DECIMAL(3,2) DEFAULT 1.00 -- Weight in overall plan completion
);

-- Learning Plan Progress Table
CREATE TABLE IF NOT EXISTS learning_plan_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    current_milestone_id UUID REFERENCES learning_plan_milestones(id),
    completed_milestones INTEGER DEFAULT 0,
    total_milestones INTEGER DEFAULT 0,
    
    -- Time Tracking
    total_study_time INTEGER DEFAULT 0, -- in minutes
    average_session_time INTEGER DEFAULT 0, -- in minutes
    last_activity_date DATE,
    consecutive_days INTEGER DEFAULT 0,
    
    -- Performance Metrics
    average_quiz_score DECIMAL(5,2) DEFAULT 0.00,
    content_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    engagement_score DECIMAL(5,2) DEFAULT 0.00, -- Based on time spent, consistency, etc.
    
    -- Adaptive Learning Metrics
    learning_velocity DECIMAL(5,2) DEFAULT 1.00, -- How fast user learns relative to plan
    difficulty_preference DECIMAL(3,2) DEFAULT 1.00,
    preferred_content_types JSONB DEFAULT '[]',
    
    -- Weekly Progress Summary
    week_number INTEGER DEFAULT 1,
    weekly_goals_met INTEGER DEFAULT 0,
    weekly_goals_total INTEGER DEFAULT 0,
    
    -- Monthly Islamic Calendar Progress
    hijri_month_progress JSONB DEFAULT '{}', -- Progress per Hijri month
    seasonal_achievements JSONB DEFAULT '[]',
    
    -- Streaks and Achievements
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_achievements INTEGER DEFAULT 0,
    
    -- Challenges and Obstacles
    identified_challenges JSONB DEFAULT '[]',
    support_needed VARCHAR(255),
    
    -- Feedback and Notes
    user_notes TEXT,
    teacher_notes TEXT,
    parent_notes TEXT,
    
    -- Progress Analytics
    analytics_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(learning_plan_id, user_id),
    CONSTRAINT valid_completion_rate CHECK (content_completion_rate >= 0 AND content_completion_rate <= 100),
    CONSTRAINT valid_engagement CHECK (engagement_score >= 0 AND engagement_score <= 100)
);

-- Indexes for Learning Plans
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_status ON learning_plans(status);
CREATE INDEX IF NOT EXISTS idx_learning_plans_active ON learning_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_plans_dates ON learning_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_learning_plans_hijri ON learning_plans(start_hijri_year, start_hijri_month);
CREATE INDEX IF NOT EXISTS idx_learning_plans_age_tier ON learning_plans(age_tier);
CREATE INDEX IF NOT EXISTS idx_learning_plans_intensity ON learning_plans(intensity);
CREATE INDEX IF NOT EXISTS idx_learning_plans_focus_areas ON learning_plans USING gin(focus_areas);

CREATE INDEX IF NOT EXISTS idx_learning_plan_milestones_plan_id ON learning_plan_milestones(learning_plan_id);
CREATE INDEX IF NOT EXISTS idx_learning_plan_milestones_sequence ON learning_plan_milestones(learning_plan_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_learning_plan_milestones_status ON learning_plan_milestones(status);
CREATE INDEX IF NOT EXISTS idx_learning_plan_milestones_target_date ON learning_plan_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_learning_plan_milestones_hijri ON learning_plan_milestones(hijri_month, hijri_week);

CREATE INDEX IF NOT EXISTS idx_learning_plan_progress_plan_user ON learning_plan_progress(learning_plan_id, user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plan_progress_user ON learning_plan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plan_progress_activity ON learning_plan_progress(last_activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_plan_progress_streak ON learning_plan_progress(current_streak DESC);

-- Update triggers
CREATE OR REPLACE FUNCTION update_learning_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_plans_updated_at
    BEFORE UPDATE ON learning_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_plans_updated_at();

CREATE OR REPLACE FUNCTION update_learning_plan_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_plan_milestones_updated_at
    BEFORE UPDATE ON learning_plan_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_plan_milestones_updated_at();

CREATE OR REPLACE FUNCTION update_learning_plan_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_plan_progress_updated_at
    BEFORE UPDATE ON learning_plan_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_plan_progress_updated_at();