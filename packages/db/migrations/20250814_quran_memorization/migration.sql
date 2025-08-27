-- Quran Memorization Tracker Schema
-- For comprehensive Quran learning and memorization tracking

-- Quran structure tables
CREATE TABLE IF NOT EXISTS "surahs" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "number" INTEGER NOT NULL UNIQUE,
  "name_arabic" TEXT NOT NULL,
  "name_english" TEXT NOT NULL,
  "name_transliteration" TEXT NOT NULL,
  "total_ayahs" INTEGER NOT NULL,
  "revelation_type" TEXT NOT NULL, -- 'Meccan' or 'Medinan'
  "revelation_order" INTEGER NOT NULL,
  "page_start" INTEGER NOT NULL, -- Mushaf page number
  "juz_start" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ayahs" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "surah_number" INTEGER NOT NULL,
  "ayah_number" INTEGER NOT NULL,
  "text_arabic" TEXT NOT NULL,
  "text_transliteration" TEXT,
  "text_translation_en" TEXT NOT NULL,
  "audio_url" TEXT, -- Primary audio URL
  "juz_number" INTEGER NOT NULL,
  "page_number" INTEGER NOT NULL,
  "word_count" INTEGER,
  "sajdah" BOOLEAN DEFAULT false,
  
  CONSTRAINT "ayah_surah_fkey" FOREIGN KEY ("surah_number") REFERENCES "surahs"("number") ON DELETE CASCADE,
  UNIQUE("surah_number", "ayah_number")
);

-- Quran reciters/qaris
CREATE TABLE IF NOT EXISTS "qaris" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "name_arabic" TEXT,
  "style" TEXT, -- 'Murattal', 'Mujawwad', 'Muallim'
  "country" TEXT,
  "audio_base_url" TEXT NOT NULL,
  "is_popular" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audio recordings for each ayah by different qaris
CREATE TABLE IF NOT EXISTS "ayah_recordings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "ayah_id" TEXT NOT NULL,
  "qari_id" TEXT NOT NULL,
  "audio_url" TEXT NOT NULL,
  "duration_seconds" INTEGER,
  "file_size_kb" INTEGER,
  "quality" TEXT DEFAULT 'high', -- 'low', 'medium', 'high'
  
  CONSTRAINT "recording_ayah_fkey" FOREIGN KEY ("ayah_id") REFERENCES "ayahs"("id") ON DELETE CASCADE,
  CONSTRAINT "recording_qari_fkey" FOREIGN KEY ("qari_id") REFERENCES "qaris"("id") ON DELETE CASCADE,
  UNIQUE("ayah_id", "qari_id")
);

-- User memorization progress
CREATE TABLE IF NOT EXISTS "memorization_progress" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "surah_number" INTEGER NOT NULL,
  "ayah_number" INTEGER NOT NULL,
  "memorization_level" INTEGER DEFAULT 0, -- 0-100 percentage
  "last_reviewed" TIMESTAMP(3),
  "review_count" INTEGER DEFAULT 0,
  "mistakes_count" INTEGER DEFAULT 0,
  "time_spent_minutes" INTEGER DEFAULT 0,
  "is_memorized" BOOLEAN DEFAULT false,
  "memorized_date" TIMESTAMP(3),
  "next_review_date" TIMESTAMP(3), -- Spaced repetition
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "memorization_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "memorization_surah_fkey" FOREIGN KEY ("surah_number") REFERENCES "surahs"("number") ON DELETE CASCADE,
  UNIQUE("user_id", "surah_number", "ayah_number")
);

-- User recordings for practice
CREATE TABLE IF NOT EXISTS "user_recordings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "surah_number" INTEGER NOT NULL,
  "ayah_number" INTEGER NOT NULL,
  "audio_url" TEXT NOT NULL,
  "duration_seconds" INTEGER,
  "accuracy_score" FLOAT, -- AI-based accuracy scoring
  "tajweed_score" FLOAT,
  "fluency_score" FLOAT,
  "feedback_notes" TEXT,
  "is_approved" BOOLEAN DEFAULT false,
  "approved_by" TEXT, -- Teacher ID
  "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_recording_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_recording_surah_fkey" FOREIGN KEY ("surah_number") REFERENCES "surahs"("number") ON DELETE CASCADE
);

-- Memorization goals and targets
CREATE TABLE IF NOT EXISTS "memorization_goals" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "goal_type" TEXT NOT NULL, -- 'surah', 'juz', 'ayahs', 'pages'
  "target_value" INTEGER NOT NULL, -- Number of surahs/juz/ayahs/pages
  "current_value" INTEGER DEFAULT 0,
  "deadline" TIMESTAMP(3),
  "is_completed" BOOLEAN DEFAULT false,
  "completed_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "goal_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Memorization sessions tracking
CREATE TABLE IF NOT EXISTS "memorization_sessions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "session_type" TEXT NOT NULL, -- 'new', 'review', 'test'
  "surah_number" INTEGER,
  "start_ayah" INTEGER,
  "end_ayah" INTEGER,
  "duration_minutes" INTEGER NOT NULL,
  "ayahs_memorized" INTEGER DEFAULT 0,
  "ayahs_reviewed" INTEGER DEFAULT 0,
  "accuracy_percentage" FLOAT,
  "session_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Tajweed rules and mistakes tracking
CREATE TABLE IF NOT EXISTS "tajweed_rules" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "name_arabic" TEXT NOT NULL,
  "category" TEXT NOT NULL, -- 'ghunnah', 'madd', 'qalqalah', etc.
  "description" TEXT NOT NULL,
  "examples" TEXT[],
  "difficulty_level" TEXT DEFAULT 'beginner'
);

CREATE TABLE IF NOT EXISTS "tajweed_mistakes" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_recording_id" TEXT NOT NULL,
  "tajweed_rule_id" TEXT NOT NULL,
  "timestamp_seconds" FLOAT NOT NULL, -- Where in the recording
  "severity" TEXT DEFAULT 'minor', -- 'minor', 'major', 'critical'
  "correction_note" TEXT,
  
  CONSTRAINT "mistake_recording_fkey" FOREIGN KEY ("user_recording_id") REFERENCES "user_recordings"("id") ON DELETE CASCADE,
  CONSTRAINT "mistake_rule_fkey" FOREIGN KEY ("tajweed_rule_id") REFERENCES "tajweed_rules"("id") ON DELETE CASCADE
);

-- Memorization streaks and achievements
CREATE TABLE IF NOT EXISTS "memorization_streaks" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "current_streak" INTEGER DEFAULT 0,
  "longest_streak" INTEGER DEFAULT 0,
  "last_activity_date" DATE,
  "total_days_active" INTEGER DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "streak_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("user_id")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_ayahs_surah" ON "ayahs"("surah_number");
CREATE INDEX IF NOT EXISTS "idx_ayahs_juz" ON "ayahs"("juz_number");
CREATE INDEX IF NOT EXISTS "idx_memorization_user" ON "memorization_progress"("user_id");
CREATE INDEX IF NOT EXISTS "idx_memorization_review" ON "memorization_progress"("next_review_date");
CREATE INDEX IF NOT EXISTS "idx_recordings_user" ON "user_recordings"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_user_date" ON "memorization_sessions"("user_id", "session_date");