-- Live Virtual Halaqah Sessions Schema
-- For real-time Islamic education sessions with WebRTC

-- Session types and configurations
CREATE TABLE IF NOT EXISTS "halaqah_sessions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "teacher_id" TEXT NOT NULL,
  "session_type" TEXT NOT NULL, -- 'live', 'scheduled', 'recorded'
  "age_groups" TEXT[] NOT NULL, -- Array of age groups allowed
  "subject_id" TEXT,
  "max_participants" INTEGER DEFAULT 30,
  "is_public" BOOLEAN DEFAULT true,
  "requires_approval" BOOLEAN DEFAULT false,
  "language" TEXT DEFAULT 'en',
  "scheduled_start" TIMESTAMP(3) NOT NULL,
  "scheduled_end" TIMESTAMP(3) NOT NULL,
  "actual_start" TIMESTAMP(3),
  "actual_end" TIMESTAMP(3),
  "status" TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended', 'cancelled'
  "meeting_room_id" TEXT UNIQUE, -- WebRTC room identifier
  "recording_url" TEXT,
  "thumbnail_url" TEXT,
  "tags" TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "session_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "session_subject_fkey" FOREIGN KEY ("subject_id") REFERENCES "islamic_subjects"("id") ON DELETE SET NULL
);

-- Session participants and attendance
CREATE TABLE IF NOT EXISTS "halaqah_participants" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" TEXT DEFAULT 'student', -- 'teacher', 'assistant', 'student', 'observer'
  "joined_at" TIMESTAMP(3),
  "left_at" TIMESTAMP(3),
  "duration_minutes" INTEGER,
  "attendance_status" TEXT DEFAULT 'registered', -- 'registered', 'attended', 'absent', 'partial'
  "approval_status" TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  "approved_by" TEXT,
  "approved_at" TIMESTAMP(3),
  "parent_consent" BOOLEAN DEFAULT false,
  "participation_score" INTEGER, -- 0-100 engagement score
  "raised_hand_count" INTEGER DEFAULT 0,
  "message_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "participant_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "participant_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "participant_approver_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL,
  UNIQUE("session_id", "user_id")
);

-- Interactive features during sessions
CREATE TABLE IF NOT EXISTS "session_interactions" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "interaction_type" TEXT NOT NULL, -- 'question', 'poll_response', 'quiz_answer', 'reaction', 'chat_message'
  "content" TEXT,
  "metadata" JSONB, -- Store poll options, quiz details, etc.
  "is_anonymous" BOOLEAN DEFAULT false,
  "is_pinned" BOOLEAN DEFAULT false,
  "replied_to_id" TEXT, -- For threaded discussions
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "interaction_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "interaction_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "interaction_reply_fkey" FOREIGN KEY ("replied_to_id") REFERENCES "session_interactions"("id") ON DELETE CASCADE
);

-- Breakout rooms for smaller group discussions
CREATE TABLE IF NOT EXISTS "breakout_rooms" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "room_name" TEXT NOT NULL,
  "room_number" INTEGER NOT NULL,
  "facilitator_id" TEXT,
  "max_participants" INTEGER DEFAULT 5,
  "topic" TEXT,
  "instructions" TEXT,
  "duration_minutes" INTEGER DEFAULT 10,
  "started_at" TIMESTAMP(3),
  "ended_at" TIMESTAMP(3),
  "status" TEXT DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
  
  CONSTRAINT "breakout_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "breakout_facilitator_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Breakout room participants
CREATE TABLE IF NOT EXISTS "breakout_participants" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "breakout_room_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "joined_at" TIMESTAMP(3),
  "left_at" TIMESTAMP(3),
  
  CONSTRAINT "breakout_participant_room_fkey" FOREIGN KEY ("breakout_room_id") REFERENCES "breakout_rooms"("id") ON DELETE CASCADE,
  CONSTRAINT "breakout_participant_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("breakout_room_id", "user_id")
);

-- Session resources and materials
CREATE TABLE IF NOT EXISTS "session_resources" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL, -- 'pdf', 'video', 'audio', 'link', 'whiteboard'
  "resource_url" TEXT NOT NULL,
  "description" TEXT,
  "uploaded_by" TEXT NOT NULL,
  "is_downloadable" BOOLEAN DEFAULT true,
  "access_level" TEXT DEFAULT 'all', -- 'all', 'registered', 'attended'
  "display_order" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "resource_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "resource_uploader_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Session recordings and clips
CREATE TABLE IF NOT EXISTS "session_recordings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "recording_url" TEXT NOT NULL,
  "duration_seconds" INTEGER NOT NULL,
  "file_size_mb" FLOAT,
  "quality" TEXT DEFAULT 'hd', -- 'sd', 'hd', 'fhd'
  "is_processed" BOOLEAN DEFAULT false,
  "is_public" BOOLEAN DEFAULT false,
  "view_count" INTEGER DEFAULT 0,
  "transcription_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "recording_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE
);

-- Session feedback and ratings
CREATE TABLE IF NOT EXISTS "session_feedback" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "content_quality" INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
  "presentation_quality" INTEGER CHECK (presentation_quality >= 1 AND presentation_quality <= 5),
  "interaction_quality" INTEGER CHECK (interaction_quality >= 1 AND interaction_quality <= 5),
  "technical_quality" INTEGER CHECK (technical_quality >= 1 AND technical_quality <= 5),
  "comments" TEXT,
  "suggestions" TEXT,
  "would_recommend" BOOLEAN,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "feedback_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "feedback_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  UNIQUE("session_id", "user_id")
);

-- Session series for recurring halaqahs
CREATE TABLE IF NOT EXISTS "halaqah_series" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "teacher_id" TEXT NOT NULL,
  "recurrence_pattern" TEXT NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly'
  "recurrence_days" INTEGER[], -- Days of week (0-6) or days of month (1-31)
  "recurrence_time" TIME NOT NULL,
  "duration_minutes" INTEGER DEFAULT 60,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "series_teacher_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Whiteboard snapshots for collaborative learning
CREATE TABLE IF NOT EXISTS "whiteboard_snapshots" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT NOT NULL,
  "snapshot_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "created_by" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT,
  
  CONSTRAINT "whiteboard_session_fkey" FOREIGN KEY ("session_id") REFERENCES "halaqah_sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "whiteboard_creator_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_sessions_teacher" ON "halaqah_sessions"("teacher_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_status" ON "halaqah_sessions"("status");
CREATE INDEX IF NOT EXISTS "idx_sessions_scheduled" ON "halaqah_sessions"("scheduled_start");
CREATE INDEX IF NOT EXISTS "idx_participants_user" ON "halaqah_participants"("user_id");
CREATE INDEX IF NOT EXISTS "idx_participants_session" ON "halaqah_participants"("session_id");
CREATE INDEX IF NOT EXISTS "idx_interactions_session" ON "session_interactions"("session_id");
CREATE INDEX IF NOT EXISTS "idx_recordings_session" ON "session_recordings"("session_id");
CREATE INDEX IF NOT EXISTS "idx_feedback_session" ON "session_feedback"("session_id");