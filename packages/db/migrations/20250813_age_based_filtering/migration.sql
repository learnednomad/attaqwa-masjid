-- Enhanced Age-Based Content Filtering Migration
-- For American Muslim Community Education Platform

-- Add more granular age groups for American school system alignment
ALTER TYPE "AgeTier" ADD VALUE 'PRESCHOOL' BEFORE 'CHILDREN'; -- 3-4 years
ALTER TYPE "AgeTier" ADD VALUE 'ELEMENTARY' AFTER 'CHILDREN'; -- 5-8 years
ALTER TYPE "AgeTier" ADD VALUE 'MIDDLE_SCHOOL' AFTER 'ELEMENTARY'; -- 9-12 years
ALTER TYPE "AgeTier" ADD VALUE 'HIGH_SCHOOL' AFTER 'YOUTH'; -- 13-17 years
ALTER TYPE "AgeTier" ADD VALUE 'COLLEGE' AFTER 'HIGH_SCHOOL'; -- 18-22 years

-- Add family account structure
CREATE TABLE IF NOT EXISTS "family_accounts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "family_name" TEXT NOT NULL,
  "primary_parent_id" TEXT NOT NULL,
  "secondary_parent_id" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "emergency_contact" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "family_primary_parent_fkey" FOREIGN KEY ("primary_parent_id") REFERENCES "users"("id") ON DELETE RESTRICT,
  CONSTRAINT "family_secondary_parent_fkey" FOREIGN KEY ("secondary_parent_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Add family relationship to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "family_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" DATE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "grade_level" TEXT; -- K-12, College, etc.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_consent" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_language" TEXT DEFAULT 'en';

ALTER TABLE "users" 
ADD CONSTRAINT "users_family_fkey" 
FOREIGN KEY ("family_id") REFERENCES "family_accounts"("id") ON DELETE SET NULL;

-- Enhanced content metadata for age filtering
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "min_age" INTEGER;
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "max_age" INTEGER;
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "grade_level" TEXT[];
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "parental_guidance" BOOLEAN DEFAULT false;
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "cultural_context" TEXT DEFAULT 'american_muslim';
ALTER TABLE "education_content" ADD COLUMN IF NOT EXISTS "language_level" TEXT DEFAULT 'native_english';

-- Content viewing restrictions
CREATE TABLE IF NOT EXISTS "content_restrictions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "content_id" TEXT NOT NULL,
  "restricted_by" TEXT NOT NULL, -- parent user ID
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "restrictions_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "restrictions_content_fkey" FOREIGN KEY ("content_id") REFERENCES "education_content"("id") ON DELETE CASCADE,
  CONSTRAINT "restrictions_parent_fkey" FOREIGN KEY ("restricted_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Parent monitoring logs
CREATE TABLE IF NOT EXISTS "parent_monitoring" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_id" TEXT NOT NULL,
  "child_id" TEXT NOT NULL,
  "action_type" TEXT NOT NULL, -- 'viewed_progress', 'restricted_content', 'approved_content'
  "details" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "monitoring_parent_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "monitoring_child_fkey" FOREIGN KEY ("child_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Weekend Islamic School Classes
CREATE TABLE IF NOT EXISTS "islamic_classes" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "age_tier" "AgeTier" NOT NULL,
  "min_age" INTEGER,
  "max_age" INTEGER,
  "day_of_week" TEXT NOT NULL, -- 'Saturday', 'Sunday'
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "teacher_id" TEXT,
  "max_students" INTEGER DEFAULT 20,
  "current_students" INTEGER DEFAULT 0,
  "location" TEXT,
  "semester" TEXT, -- 'Fall 2024', 'Spring 2025'
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "class_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS "class_enrollments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "class_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "enrolled_by" TEXT NOT NULL, -- parent who enrolled
  "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'active', -- 'active', 'dropped', 'completed'
  
  CONSTRAINT "enrollment_class_fkey" FOREIGN KEY ("class_id") REFERENCES "islamic_classes"("id") ON DELETE CASCADE,
  CONSTRAINT "enrollment_student_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "enrollment_parent_fkey" FOREIGN KEY ("enrolled_by") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("class_id", "student_id")
);

-- Homework assignments
CREATE TABLE IF NOT EXISTS "homework_assignments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "class_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "content_id" TEXT, -- Link to educational content
  "due_date" TIMESTAMP(3) NOT NULL,
  "points" INTEGER DEFAULT 10,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "homework_class_fkey" FOREIGN KEY ("class_id") REFERENCES "islamic_classes"("id") ON DELETE CASCADE,
  CONSTRAINT "homework_content_fkey" FOREIGN KEY ("content_id") REFERENCES "education_content"("id") ON DELETE SET NULL
);

-- Homework submissions
CREATE TABLE IF NOT EXISTS "homework_submissions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "assignment_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "submission_text" TEXT,
  "submission_url" TEXT,
  "grade" INTEGER,
  "feedback" TEXT,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "graded_at" TIMESTAMP(3),
  
  CONSTRAINT "submission_assignment_fkey" FOREIGN KEY ("assignment_id") REFERENCES "homework_assignments"("id") ON DELETE CASCADE,
  CONSTRAINT "submission_student_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("assignment_id", "student_id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_users_age_tier" ON "users"("age_tier");
CREATE INDEX IF NOT EXISTS "idx_users_family_id" ON "users"("family_id");
CREATE INDEX IF NOT EXISTS "idx_content_age_range" ON "education_content"("min_age", "max_age");
CREATE INDEX IF NOT EXISTS "idx_content_grade_level" ON "education_content"("grade_level");
CREATE INDEX IF NOT EXISTS "idx_enrollments_student" ON "class_enrollments"("student_id");
CREATE INDEX IF NOT EXISTS "idx_homework_due_date" ON "homework_assignments"("due_date");