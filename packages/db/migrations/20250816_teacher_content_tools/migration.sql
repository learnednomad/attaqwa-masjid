-- Teacher Content Creation Tools Schema
-- For creating, managing, and distributing educational content

-- Content templates for consistent creation
CREATE TABLE IF NOT EXISTS "content_templates" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "template_type" TEXT NOT NULL, -- 'lesson', 'quiz', 'assignment', 'article', 'video_script'
  "structure" JSONB NOT NULL, -- Template structure and fields
  "default_values" JSONB,
  "created_by" TEXT NOT NULL,
  "is_public" BOOLEAN DEFAULT false,
  "usage_count" INTEGER DEFAULT 0,
  "tags" TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "template_creator_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Teacher-created content
CREATE TABLE IF NOT EXISTS "teacher_content" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content_type" TEXT NOT NULL, -- 'lesson', 'quiz', 'assignment', 'article', 'worksheet', 'presentation'
  "subject_id" TEXT,
  "teacher_id" TEXT NOT NULL,
  "template_id" TEXT,
  "age_groups" TEXT[] NOT NULL,
  "difficulty_level" TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'advanced'
  "content_data" JSONB NOT NULL, -- Structured content based on type
  "media_urls" TEXT[], -- Associated media files
  "estimated_duration" INTEGER, -- in minutes
  "language" TEXT DEFAULT 'en',
  "is_published" BOOLEAN DEFAULT false,
  "published_at" TIMESTAMP(3),
  "is_featured" BOOLEAN DEFAULT false,
  "approval_status" TEXT DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'rejected'
  "approved_by" TEXT,
  "approval_notes" TEXT,
  "view_count" INTEGER DEFAULT 0,
  "completion_count" INTEGER DEFAULT 0,
  "average_rating" FLOAT,
  "tags" TEXT[],
  "prerequisites" TEXT[], -- IDs of prerequisite content
  "learning_objectives" TEXT[],
  "assessment_criteria" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "content_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "content_subject_fkey" FOREIGN KEY ("subject_id") REFERENCES "islamic_subjects"("id") ON DELETE SET NULL,
  CONSTRAINT "content_template_fkey" FOREIGN KEY ("template_id") REFERENCES "content_templates"("id") ON DELETE SET NULL,
  CONSTRAINT "content_approver_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Content review and collaboration
CREATE TABLE IF NOT EXISTS "content_reviews" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "review_type" TEXT NOT NULL, -- 'peer', 'admin', 'parent', 'student'
  "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
  "accuracy_score" INTEGER CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  "clarity_score" INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
  "engagement_score" INTEGER CHECK (engagement_score >= 1 AND engagement_score <= 5),
  "age_appropriateness_score" INTEGER CHECK (age_appropriateness_score >= 1 AND age_appropriateness_score <= 5),
  "comments" TEXT,
  "suggestions" TEXT[],
  "is_recommended" BOOLEAN,
  "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "review_content_fkey" FOREIGN KEY ("content_id") REFERENCES "teacher_content"("id") ON DELETE CASCADE,
  CONSTRAINT "review_reviewer_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("content_id", "reviewer_id")
);

-- Content collections/curricula
CREATE TABLE IF NOT EXISTS "content_collections" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "collection_type" TEXT NOT NULL, -- 'curriculum', 'course', 'series', 'playlist'
  "teacher_id" TEXT NOT NULL,
  "subject_id" TEXT,
  "age_groups" TEXT[] NOT NULL,
  "duration_weeks" INTEGER,
  "is_sequential" BOOLEAN DEFAULT true, -- Must follow order
  "is_published" BOOLEAN DEFAULT false,
  "enrollment_count" INTEGER DEFAULT 0,
  "completion_rate" FLOAT,
  "thumbnail_url" TEXT,
  "tags" TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "collection_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "collection_subject_fkey" FOREIGN KEY ("subject_id") REFERENCES "islamic_subjects"("id") ON DELETE SET NULL
);

-- Content items within collections
CREATE TABLE IF NOT EXISTS "collection_items" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "collection_id" TEXT NOT NULL,
  "content_id" TEXT NOT NULL,
  "order_index" INTEGER NOT NULL,
  "is_mandatory" BOOLEAN DEFAULT true,
  "unlock_after_days" INTEGER DEFAULT 0, -- Days after enrollment to unlock
  "notes" TEXT, -- Teacher notes for this item
  
  CONSTRAINT "item_collection_fkey" FOREIGN KEY ("collection_id") REFERENCES "content_collections"("id") ON DELETE CASCADE,
  CONSTRAINT "item_content_fkey" FOREIGN KEY ("content_id") REFERENCES "teacher_content"("id") ON DELETE CASCADE,
  UNIQUE("collection_id", "order_index")
);

-- Rich media assets library
CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "asset_type" TEXT NOT NULL, -- 'image', 'video', 'audio', 'document', 'presentation'
  "file_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "file_size_mb" FLOAT,
  "duration_seconds" INTEGER, -- For audio/video
  "dimensions" JSONB, -- For images/videos
  "mime_type" TEXT,
  "uploaded_by" TEXT NOT NULL,
  "is_public" BOOLEAN DEFAULT false,
  "usage_rights" TEXT, -- 'private', 'masjid_only', 'public_domain', 'creative_commons'
  "attribution" TEXT,
  "tags" TEXT[],
  "transcription" TEXT, -- For audio/video
  "alt_text" TEXT, -- For images
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "asset_uploader_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Question bank for assessments
CREATE TABLE IF NOT EXISTS "question_bank" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_text" TEXT NOT NULL,
  "question_type" TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'ordering'
  "subject_id" TEXT,
  "teacher_id" TEXT NOT NULL,
  "age_groups" TEXT[] NOT NULL,
  "difficulty_level" TEXT DEFAULT 'medium',
  "points" INTEGER DEFAULT 1,
  "options" JSONB, -- For multiple choice/matching
  "correct_answer" JSONB NOT NULL,
  "explanation" TEXT,
  "hint" TEXT,
  "media_url" TEXT,
  "tags" TEXT[],
  "usage_count" INTEGER DEFAULT 0,
  "correct_rate" FLOAT, -- Percentage of correct answers
  "is_verified" BOOLEAN DEFAULT false,
  "verified_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "question_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "question_subject_fkey" FOREIGN KEY ("subject_id") REFERENCES "islamic_subjects"("id") ON DELETE SET NULL,
  CONSTRAINT "question_verifier_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Assessment builder
CREATE TABLE IF NOT EXISTS "assessments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assessment_type" TEXT NOT NULL, -- 'quiz', 'test', 'exam', 'homework', 'project'
  "teacher_id" TEXT NOT NULL,
  "subject_id" TEXT,
  "age_groups" TEXT[] NOT NULL,
  "total_points" INTEGER NOT NULL,
  "passing_score" INTEGER,
  "time_limit_minutes" INTEGER,
  "attempts_allowed" INTEGER DEFAULT 1,
  "shuffle_questions" BOOLEAN DEFAULT false,
  "shuffle_options" BOOLEAN DEFAULT false,
  "show_results" TEXT DEFAULT 'after_submission', -- 'immediately', 'after_submission', 'after_deadline', 'manual'
  "instructions" TEXT,
  "available_from" TIMESTAMP(3),
  "available_until" TIMESTAMP(3),
  "is_published" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "assessment_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "assessment_subject_fkey" FOREIGN KEY ("subject_id") REFERENCES "islamic_subjects"("id") ON DELETE SET NULL
);

-- Assessment questions
CREATE TABLE IF NOT EXISTS "assessment_questions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "assessment_id" TEXT NOT NULL,
  "question_id" TEXT, -- From question bank
  "custom_question" JSONB, -- Or custom question
  "order_index" INTEGER NOT NULL,
  "points" INTEGER NOT NULL,
  "is_bonus" BOOLEAN DEFAULT false,
  
  CONSTRAINT "assessment_question_assessment_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE,
  CONSTRAINT "assessment_question_bank_fkey" FOREIGN KEY ("question_id") REFERENCES "question_bank"("id") ON DELETE SET NULL
);

-- Content analytics
CREATE TABLE IF NOT EXISTS "content_analytics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "views" INTEGER DEFAULT 0,
  "unique_viewers" INTEGER DEFAULT 0,
  "completions" INTEGER DEFAULT 0,
  "average_time_spent" INTEGER, -- in seconds
  "engagement_score" FLOAT, -- 0-100
  "quiz_attempts" INTEGER DEFAULT 0,
  "quiz_pass_rate" FLOAT,
  "feedback_count" INTEGER DEFAULT 0,
  "share_count" INTEGER DEFAULT 0,
  
  CONSTRAINT "analytics_content_fkey" FOREIGN KEY ("content_id") REFERENCES "teacher_content"("id") ON DELETE CASCADE,
  UNIQUE("content_id", "date")
);

-- Content sharing and collaboration
CREATE TABLE IF NOT EXISTS "content_shares" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_id" TEXT NOT NULL,
  "shared_by" TEXT NOT NULL,
  "shared_with" TEXT[], -- User IDs
  "share_type" TEXT NOT NULL, -- 'view', 'edit', 'co_author'
  "message" TEXT,
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "share_content_fkey" FOREIGN KEY ("content_id") REFERENCES "teacher_content"("id") ON DELETE CASCADE,
  CONSTRAINT "share_sharer_fkey" FOREIGN KEY ("shared_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Rubrics for grading
CREATE TABLE IF NOT EXISTS "grading_rubrics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "teacher_id" TEXT NOT NULL,
  "rubric_type" TEXT NOT NULL, -- 'holistic', 'analytic'
  "criteria" JSONB NOT NULL, -- Array of criteria with levels and points
  "total_points" INTEGER NOT NULL,
  "is_public" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "rubric_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_teacher_content_teacher" ON "teacher_content"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_teacher_content_subject" ON "teacher_content"("subject_id");
CREATE INDEX IF NOT EXISTS "idx_teacher_content_published" ON "teacher_content"("is_published");
CREATE INDEX IF NOT EXISTS "idx_content_reviews_content" ON "content_reviews"("content_id");
CREATE INDEX IF NOT EXISTS "idx_collections_teacher" ON "content_collections"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_question_bank_teacher" ON "question_bank"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_assessments_teacher" ON "assessments"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_media_assets_uploader" ON "media_assets"("uploaded_by");
CREATE INDEX IF NOT EXISTS "idx_content_analytics_date" ON "content_analytics"("date");