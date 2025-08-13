-- AlterEnum: Add new AgeTier values before removing old ones
ALTER TYPE "AgeTier" ADD VALUE IF NOT EXISTS 'CHILDREN';
ALTER TYPE "AgeTier" ADD VALUE IF NOT EXISTS 'YOUTH';
ALTER TYPE "AgeTier" ADD VALUE IF NOT EXISTS 'ADULTS';
ALTER TYPE "AgeTier" ADD VALUE IF NOT EXISTS 'SENIORS';
ALTER TYPE "AgeTier" ADD VALUE IF NOT EXISTS 'ALL_AGES';

-- AlterEnum: Add MODERATOR role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MODERATOR';

-- CreateEnum: Education Content Types
CREATE TYPE "EducationContentType" AS ENUM ('LESSON', 'QUIZ', 'VIDEO', 'AUDIO', 'READING', 'INTERACTIVE');

-- CreateEnum: Islamic Subjects (extend existing if needed)
CREATE TYPE "IslamicSubject" AS ENUM (
    'QURAN', 'HADITH', 'FIQH', 'AQIDAH', 'SEERAH', 
    'ISLAMIC_HISTORY', 'ARABIC_LANGUAGE', 'DUA_DHIKR', 
    'ISLAMIC_ETIQUETTE', 'COMPARATIVE_RELIGION', 'TAFSIR', 
    'AKHLAQ', 'WORSHIP', 'SIRA', 'HISTORY'
);

-- CreateEnum: Difficulty Levels
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SCHOLAR');

-- CreateEnum: Progress Status
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- CreateEnum: Question Types
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MATCHING', 'FILL_BLANK');

-- CreateEnum: Resource Types
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'VIDEO', 'AUDIO', 'LINK');

-- CreateEnum: Reference Types
CREATE TYPE "ReferenceType" AS ENUM ('QURAN', 'HADITH', 'DUA');

-- CreateEnum: Achievement Types
CREATE TYPE "AchievementType" AS ENUM ('COMPLETION', 'SCORE', 'STREAK', 'TIME_SPENT', 'QUIZ_ATTEMPTS');

-- CreateTable: Education Content (Core model)
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
    "prerequisites" TEXT[],
    "tags" TEXT[],
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "arabicContent" TEXT,
    "transliteration" TEXT,
    "translation" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Chapters
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chapterContent" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Content Resources
CREATE TABLE "content_resources" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Quizzes
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "contentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timeLimit" INTEGER,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Quiz Questions
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "arabicText" TEXT,
    "reference" TEXT,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Question Options
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Quiz Attempts
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Quiz Answers
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Update User Progress table
ALTER TABLE "user_progress" 
ADD COLUMN IF NOT EXISTS "contentId" TEXT,
ADD COLUMN IF NOT EXISTS "status" "ProgressStatus" DEFAULT 'NOT_STARTED',
ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "currentChapter" INTEGER,
ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastAccessed" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "attempts" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- CreateTable: Education Certificates
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

-- CreateTable: Islamic References
CREATE TABLE "islamic_references" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "surahNumber" INTEGER,
    "ayahNumber" INTEGER,
    "hadithBook" TEXT,
    "hadithNumber" TEXT,
    "arabicText" TEXT NOT NULL,
    "transliteration" TEXT,
    "translation" TEXT NOT NULL,
    "grade" TEXT,

    CONSTRAINT "islamic_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Learning Paths
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" "IslamicSubject" NOT NULL,
    "ageTier" "AgeTier" NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Learning Path Items
CREATE TABLE "learning_path_items" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "learning_path_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User Learning Paths
CREATE TABLE "user_learning_paths" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentItemId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Achievements
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteriaType" "AchievementType" NOT NULL,
    "criteriaValue" INTEGER NOT NULL,
    "subject" "IslamicSubject",
    "points" INTEGER NOT NULL DEFAULT 10,
    "isRare" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User Achievements
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Education Content
CREATE INDEX "education_content_contentType_subject_ageTier_difficultyLeve" ON "education_content"("contentType", "subject", "ageTier", "difficultyLevel");
CREATE INDEX "education_content_isPublished_contentType_idx" ON "education_content"("isPublished", "contentType");
CREATE INDEX "education_content_authorId_idx" ON "education_content"("authorId");
CREATE INDEX "education_content_subject_idx" ON "education_content"("subject");
CREATE INDEX "education_content_ageTier_idx" ON "education_content"("ageTier");
CREATE INDEX "education_content_title_idx" ON "education_content"("title");

-- CreateIndex: Chapters
CREATE UNIQUE INDEX "chapters_contentId_order_key" ON "chapters"("contentId", "order");
CREATE INDEX "chapters_contentId_idx" ON "chapters"("contentId");

-- CreateIndex: Resources
CREATE INDEX "content_resources_contentId_idx" ON "content_resources"("contentId");

-- CreateIndex: Quizzes
CREATE INDEX "quizzes_contentId_idx" ON "quizzes"("contentId");
CREATE INDEX "quizzes_isActive_idx" ON "quizzes"("isActive");

-- CreateIndex: Quiz Questions
CREATE UNIQUE INDEX "quiz_questions_quizId_order_key" ON "quiz_questions"("quizId", "order");
CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");

-- CreateIndex: Question Options
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex: Quiz Attempts
CREATE INDEX "quiz_attempts_userId_quizId_idx" ON "quiz_attempts"("userId", "quizId");
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");
CREATE INDEX "quiz_attempts_completedAt_idx" ON "quiz_attempts"("completedAt");

-- CreateIndex: Quiz Answers
CREATE UNIQUE INDEX "quiz_answers_attemptId_questionId_key" ON "quiz_answers"("attemptId", "questionId");
CREATE INDEX "quiz_answers_attemptId_idx" ON "quiz_answers"("attemptId");
CREATE INDEX "quiz_answers_questionId_idx" ON "quiz_answers"("questionId");

-- CreateIndex: User Progress
CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_userId_contentId_key" ON "user_progress"("userId", "contentId");
CREATE INDEX IF NOT EXISTS "user_progress_userId_status_idx" ON "user_progress"("userId", "status");
CREATE INDEX IF NOT EXISTS "user_progress_contentId_idx" ON "user_progress"("contentId");
CREATE INDEX IF NOT EXISTS "user_progress_lastAccessed_idx" ON "user_progress"("lastAccessed");

-- CreateIndex: Certificates
CREATE INDEX "education_certificates_userId_idx" ON "education_certificates"("userId");
CREATE UNIQUE INDEX "education_certificates_verificationCode_key" ON "education_certificates"("verificationCode");
CREATE INDEX "education_certificates_verificationCode_idx" ON "education_certificates"("verificationCode");

-- CreateIndex: Islamic References
CREATE INDEX "islamic_references_contentId_idx" ON "islamic_references"("contentId");

-- CreateIndex: Learning Paths
CREATE INDEX "learning_paths_subject_ageTier_difficultyLevel_idx" ON "learning_paths"("subject", "ageTier", "difficultyLevel");
CREATE INDEX "learning_paths_isPublished_idx" ON "learning_paths"("isPublished");

-- CreateIndex: Learning Path Items
CREATE UNIQUE INDEX "learning_path_items_pathId_order_key" ON "learning_path_items"("pathId", "order");
CREATE INDEX "learning_path_items_pathId_idx" ON "learning_path_items"("pathId");
CREATE INDEX "learning_path_items_contentId_idx" ON "learning_path_items"("contentId");

-- CreateIndex: User Learning Paths
CREATE UNIQUE INDEX "user_learning_paths_userId_pathId_key" ON "user_learning_paths"("userId", "pathId");
CREATE INDEX "user_learning_paths_userId_idx" ON "user_learning_paths"("userId");
CREATE INDEX "user_learning_paths_pathId_idx" ON "user_learning_paths"("pathId");

-- CreateIndex: User Achievements
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");
CREATE INDEX "user_achievements_achievementId_idx" ON "user_achievements"("achievementId");

-- CreateIndex: User indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_ageTier_idx" ON "users"("ageTier");

-- AddForeignKey: Education Content
ALTER TABLE "education_content" ADD CONSTRAINT "education_content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Chapters
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Content Resources
ALTER TABLE "content_resources" ADD CONSTRAINT "content_resources_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Quizzes
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Quiz Questions
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Question Options
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Quiz Attempts
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Quiz Answers
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: User Progress (if contentId is set)
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Education Certificates
ALTER TABLE "education_certificates" ADD CONSTRAINT "education_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Islamic References
ALTER TABLE "islamic_references" ADD CONSTRAINT "islamic_references_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Learning Path Items
ALTER TABLE "learning_path_items" ADD CONSTRAINT "learning_path_items_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_items" ADD CONSTRAINT "learning_path_items_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "education_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: User Learning Paths
ALTER TABLE "user_learning_paths" ADD CONSTRAINT "user_learning_paths_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_learning_paths" ADD CONSTRAINT "user_learning_paths_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Achievements
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;