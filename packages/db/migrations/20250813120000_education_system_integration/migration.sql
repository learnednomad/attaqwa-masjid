-- CreateEnum for Education System
CREATE TYPE "EducationContentType" AS ENUM ('LESSON', 'QUIZ', 'VIDEO', 'AUDIO', 'READING', 'INTERACTIVE');

-- CreateEnum for Islamic Subjects (expand existing Category)
CREATE TYPE "IslamicSubject" AS ENUM ('QURAN', 'HADITH', 'FIQH', 'AQIDAH', 'SEERAH', 'ISLAMIC_HISTORY', 'ARABIC_LANGUAGE', 'DUA_DHIKR', 'ISLAMIC_ETIQUETTE', 'COMPARATIVE_RELIGION');

-- CreateEnum for Difficulty Levels
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SCHOLAR');

-- CreateEnum for Progress Status
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- CreateEnum for Question Types
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MATCHING', 'FILL_BLANK');

-- Update AgeTier enum to match API expectations
ALTER TYPE "AgeTier" RENAME TO "AgeTier_old";
CREATE TYPE "AgeTier" AS ENUM ('CHILDREN', 'YOUTH', 'ADULTS', 'SENIORS', 'ALL_AGES');

-- Migrate existing data
ALTER TABLE "users" ALTER COLUMN "ageTier" TYPE "AgeTier" USING CASE
  WHEN "ageTier"::text = 'PRIMARY' THEN 'CHILDREN'::AgeTier
  WHEN "ageTier"::text = 'INTERMEDIATE' THEN 'YOUTH'::AgeTier
  WHEN "ageTier"::text = 'HIGHER' THEN 'ADULTS'::AgeTier
  ELSE NULL
END;

ALTER TABLE "content_modules" ALTER COLUMN "ageTier" TYPE "AgeTier" USING CASE
  WHEN "ageTier"::text = 'PRIMARY' THEN 'CHILDREN'::AgeTier
  WHEN "ageTier"::text = 'INTERMEDIATE' THEN 'YOUTH'::AgeTier
  WHEN "ageTier"::text = 'HIGHER' THEN 'ADULTS'::AgeTier
  ELSE 'ALL_AGES'::AgeTier
END;

-- Drop old enum
DROP TYPE "AgeTier_old";

-- Add MODERATOR role
ALTER TYPE "Role" ADD VALUE 'MODERATOR';

-- CreateTable for comprehensive Education Content
CREATE TABLE "education_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "EducationContentType" NOT NULL,
    "subject" "IslamicSubject" NOT NULL,
    "ageTier" "AgeTier" NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "arabicContent" TEXT,
    "transliteration" TEXT,
    "translation" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "timeLimit" INTEGER, -- for quizzes
    "passingScore" INTEGER DEFAULT 70, -- for quizzes
    "maxAttempts" INTEGER DEFAULT 3, -- for quizzes
    "showCorrectAnswers" BOOLEAN DEFAULT true, -- for quizzes
    "shuffleQuestions" BOOLEAN DEFAULT false, -- for quizzes
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Quiz Questions
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "arabicText" TEXT,
    "reference" TEXT, -- Quran/Hadith reference

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Lesson Chapters
CREATE TABLE "lesson_chapters" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,

    CONSTRAINT "lesson_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Lesson Resources
CREATE TABLE "lesson_resources" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- PDF, VIDEO, AUDIO, LINK

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable for comprehensive User Progress
CREATE TABLE "education_user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0, -- percentage 0-100
    "currentChapter" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0, -- in minutes
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" INTEGER, -- for quizzes
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Quiz Attempts
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL, -- Array of {questionId, answer, isCorrect, timeSpent}
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL, -- in minutes
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "isPassed" BOOLEAN NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Education Certificates
CREATE TABLE "education_certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "contentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "verificationCode" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL DEFAULT 'Masjid At-Taqwa',
    "issuerSignature" TEXT,

    CONSTRAINT "education_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Learning Paths
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" "IslamicSubject" NOT NULL,
    "ageTier" "AgeTier" NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "estimatedDuration" INTEGER NOT NULL, -- total duration in hours
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Learning Path Contents (junction table)
CREATE TABLE "learning_path_contents" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "learning_path_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable for User Achievements
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteriaType" TEXT NOT NULL, -- COMPLETION, SCORE, STREAK, TIME_SPENT, QUIZ_ATTEMPTS
    "criteriaValue" INTEGER NOT NULL,
    "subject" "IslamicSubject",
    "points" INTEGER NOT NULL,
    "isRare" BOOLEAN NOT NULL DEFAULT false,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 100, -- 0-100

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "education_content_subject_idx" ON "education_content"("subject");
CREATE INDEX "education_content_ageTier_idx" ON "education_content"("ageTier");
CREATE INDEX "education_content_difficultyLevel_idx" ON "education_content"("difficultyLevel");
CREATE INDEX "education_content_contentType_idx" ON "education_content"("contentType");
CREATE INDEX "education_content_isPublished_idx" ON "education_content"("isPublished");
CREATE INDEX "education_content_authorId_idx" ON "education_content"("authorId");

CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");
CREATE INDEX "lesson_chapters_lessonId_idx" ON "lesson_chapters"("lessonId");
CREATE INDEX "lesson_resources_lessonId_idx" ON "lesson_resources"("lessonId");

CREATE INDEX "education_user_progress_userId_idx" ON "education_user_progress"("userId");
CREATE INDEX "education_user_progress_contentId_idx" ON "education_user_progress"("contentId");
CREATE INDEX "education_user_progress_status_idx" ON "education_user_progress"("status");

CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

CREATE INDEX "education_certificates_userId_idx" ON "education_certificates"("userId");
CREATE INDEX "education_certificates_verificationCode_idx" ON "education_certificates"("verificationCode");

CREATE INDEX "learning_paths_subject_idx" ON "learning_paths"("subject");
CREATE INDEX "learning_paths_ageTier_idx" ON "learning_paths"("ageTier");
CREATE INDEX "learning_path_contents_pathId_idx" ON "learning_path_contents"("pathId");

CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- Create unique constraints
CREATE UNIQUE INDEX "education_user_progress_userId_contentId_key" ON "education_user_progress"("userId", "contentId");
CREATE UNIQUE INDEX "education_certificates_verificationCode_key" ON "education_certificates"("verificationCode");
CREATE UNIQUE INDEX "learning_path_contents_pathId_contentId_key" ON "learning_path_contents"("pathId", "contentId");

-- Add Foreign Key constraints
ALTER TABLE "education_content" ADD CONSTRAINT "education_content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_chapters" ADD CONSTRAINT "lesson_chapters_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "education_user_progress" ADD CONSTRAINT "education_user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "education_user_progress" ADD CONSTRAINT "education_user_progress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "education_certificates" ADD CONSTRAINT "education_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "education_certificates" ADD CONSTRAINT "education_certificates_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "learning_path_contents" ADD CONSTRAINT "learning_path_contents_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_path_contents" ADD CONSTRAINT "learning_path_contents_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from old structure to new structure
-- This is a safe migration that preserves existing content_modules and lessons
INSERT INTO "education_content" (
  "id", "title", "description", "content", "contentType", "subject", "ageTier", 
  "difficultyLevel", "estimatedDuration", "isPublished", "authorId", "createdAt", "updatedAt"
)
SELECT 
  cm."id",
  cm."title",
  cm."description",
  COALESCE(STRING_AGG(l."content", E'\n\n' ORDER BY l."sortOrder"), cm."description") as content,
  'LESSON'::EducationContentType,
  CASE cm."category"
    WHEN 'QURAN' THEN 'QURAN'::IslamicSubject
    WHEN 'TAFSIR' THEN 'QURAN'::IslamicSubject
    WHEN 'SIRA' THEN 'SEERAH'::IslamicSubject
    WHEN 'CHARACTER_BUILDING' THEN 'ISLAMIC_ETIQUETTE'::IslamicSubject
    WHEN 'PRAYER' THEN 'FIQH'::IslamicSubject
    ELSE 'QURAN'::IslamicSubject
  END,
  cm."ageTier",
  CASE cm."ageTier"
    WHEN 'CHILDREN' THEN 'BEGINNER'::DifficultyLevel
    WHEN 'YOUTH' THEN 'INTERMEDIATE'::DifficultyLevel
    WHEN 'ADULTS' THEN 'INTERMEDIATE'::DifficultyLevel
    ELSE 'BEGINNER'::DifficultyLevel
  END,
  30, -- default 30 minutes
  cm."isActive",
  (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1), -- assign to first admin
  cm."createdAt",
  cm."updatedAt"
FROM "content_modules" cm
LEFT JOIN "lessons" l ON l."moduleId" = cm."id"
GROUP BY cm."id", cm."title", cm."description", cm."category", cm."ageTier", 
         cm."isActive", cm."createdAt", cm."updatedAt";

-- Migrate user progress
INSERT INTO "education_user_progress" (
  "userId", "contentId", "status", "progress", "score", "timeSpent", 
  "lastAccessed", "completedAt", "createdAt", "updatedAt"
)
SELECT 
  up."userId",
  up."lessonId",
  CASE 
    WHEN up."completed" = true THEN 'COMPLETED'::ProgressStatus
    WHEN up."score" > 0 THEN 'IN_PROGRESS'::ProgressStatus
    ELSE 'NOT_STARTED'::ProgressStatus
  END,
  CASE WHEN up."completed" = true THEN 100 ELSE LEAST(up."score", 99) END,
  up."score",
  10, -- default 10 minutes
  up."updatedAt",
  CASE WHEN up."completed" = true THEN up."updatedAt" ELSE NULL END,
  up."createdAt",
  up."updatedAt"
FROM "user_progress" up
WHERE EXISTS (SELECT 1 FROM "education_content" ec WHERE ec."id" = up."lessonId");