-- Islamic Calendar Events Table
-- Stores Islamic events and holidays for calendar integration

CREATE TABLE IF NOT EXISTS islamic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'RELIGIOUS', 'CULTURAL', 'EDUCATIONAL'
    islamic_event_name VARCHAR(100), -- 'RAMADAN', 'EID_FITR', 'HAJJ', etc.
    
    -- Hijri Calendar Data
    hijri_year INTEGER NOT NULL,
    hijri_month INTEGER NOT NULL CHECK (hijri_month >= 1 AND hijri_month <= 12),
    hijri_day INTEGER CHECK (hijri_day >= 1 AND hijri_day <= 30),
    hijri_date VARCHAR(20), -- Formatted Hijri date string
    
    -- Gregorian Calendar Data (approximate)
    event_date DATE,
    start_time TIME,
    end_time TIME,
    
    -- Age Tier Filtering
    age_tier VARCHAR(20) NOT NULL DEFAULT 'ALL_AGES',
    min_age INTEGER,
    max_age INTEGER,
    
    -- Event Attributes
    is_major_event BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT true,
    recurrence_pattern VARCHAR(50), -- 'YEARLY', 'MONTHLY'
    priority INTEGER DEFAULT 1,
    
    -- Content and Media
    image_url VARCHAR(500),
    banner_url VARCHAR(500),
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    -- Geographic Relevance
    geographic_relevance VARCHAR(100) DEFAULT 'GLOBAL', -- 'GLOBAL', 'LOCAL', 'REGIONAL'
    location_specific BOOLEAN DEFAULT false,
    
    -- Status and Moderation
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    moderation_status VARCHAR(20) DEFAULT 'APPROVED',
    
    -- Islamic Calendar Specific
    moon_sighting_dependent BOOLEAN DEFAULT false,
    date_uncertainty INTEGER DEFAULT 0, -- Days of uncertainty
    
    -- Educational Integration
    educational_content_ids JSONB DEFAULT '[]',
    learning_objectives TEXT[],
    recommended_activities TEXT[],
    
    -- Community Features
    community_celebration BOOLEAN DEFAULT false,
    masjid_event BOOLEAN DEFAULT false,
    special_prayers BOOLEAN DEFAULT false,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Version Control
    version INTEGER DEFAULT 1,
    last_modified_by UUID REFERENCES users(id)
);

-- Indexes for Islamic Events
CREATE INDEX IF NOT EXISTS idx_islamic_events_hijri_date ON islamic_events(hijri_year, hijri_month, hijri_day);
CREATE INDEX IF NOT EXISTS idx_islamic_events_gregorian_date ON islamic_events(event_date);
CREATE INDEX IF NOT EXISTS idx_islamic_events_age_tier ON islamic_events(age_tier);
CREATE INDEX IF NOT EXISTS idx_islamic_events_event_type ON islamic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_islamic_events_islamic_event_name ON islamic_events(islamic_event_name);
CREATE INDEX IF NOT EXISTS idx_islamic_events_active_published ON islamic_events(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_islamic_events_major ON islamic_events(is_major_event, priority DESC);
CREATE INDEX IF NOT EXISTS idx_islamic_events_tags ON islamic_events USING gin(tags);

-- Insert Major Islamic Events
INSERT INTO islamic_events (
    title, description, event_type, islamic_event_name,
    hijri_year, hijri_month, hijri_day, hijri_date,
    age_tier, is_major_event, is_recurring, priority,
    tags, educational_content_ids, learning_objectives, recommended_activities,
    moon_sighting_dependent, special_prayers, community_celebration, masjid_event
) VALUES
-- Muharram Events
(
    'Ashura - Day of Remembrance', 
    'The 10th day of Muharram, commemorating various historical events including the sacrifice of Hussein',
    'RELIGIOUS', 'ASHURA',
    1446, 1, 10, '10 Muharram 1446',
    'ALL_AGES', true, true, 10,
    '["ashura", "muharram", "history", "sacrifice", "remembrance"]',
    '[]',
    ARRAY['Understand the historical significance of Ashura', 'Learn about patience and perseverance', 'Reflect on sacrifice and devotion'],
    ARRAY['Historical storytelling', 'Community reflection', 'Charity giving', 'Special prayers'],
    false, true, true, true
),

-- Rabi al-Awwal Events  
(
    'Mawlid an-Nabi - Birth of Prophet Muhammad (PBUH)',
    'Celebrating the birth of Prophet Muhammad (peace be upon him) and reflecting on his teachings',
    'RELIGIOUS', 'MAWLID',
    1446, 3, 12, '12 Rabi al-Awwal 1446',
    'ALL_AGES', true, true, 10,
    '["mawlid", "prophet", "muhammad", "birthday", "seerah"]',
    '[]',
    ARRAY['Learn about the life of Prophet Muhammad', 'Study prophetic teachings', 'Strengthen love for the Prophet'],
    ARRAY['Seerah storytelling', 'Nasheeds', 'Community gathering', 'Charity'],
    false, true, true, true
),

-- Rajab Events
(
    'Isra and Miraj - Night Journey',
    'Commemoration of Prophet Muhammad''s miraculous night journey from Mecca to Jerusalem and ascension to heaven',
    'RELIGIOUS', 'ISRA_MIRAJ', 
    1446, 7, 27, '27 Rajab 1446',
    'ALL_AGES', true, true, 9,
    '["isra", "miraj", "night_journey", "ascension", "miracle"]',
    '[]',
    ARRAY['Understand the significance of Isra and Miraj', 'Learn about the five daily prayers', 'Strengthen spirituality'],
    ARRAY['Special night prayers', 'Educational lectures', 'Art and crafts', 'Community discussion'],
    false, true, true, true
),

-- Ramadan Events
(
    'Ramadan - Holy Month of Fasting',
    'The blessed month of fasting, Quran reading, charity, and spiritual reflection',
    'RELIGIOUS', 'RAMADAN',
    1446, 9, 1, '1 Ramadan 1446',
    'ALL_AGES', true, true, 10,
    '["ramadan", "fasting", "quran", "charity", "spirituality"]',
    '[]',
    ARRAY['Learn the purpose and benefits of fasting', 'Increase Quran recitation', 'Practice charity and kindness'],
    ARRAY['Daily Iftar', 'Tarawih prayers', 'Quran study circles', 'Community service'],
    true, true, true, true
),

(
    'Laylat al-Qadr - Night of Decree',
    'The blessed night when the Quran was first revealed, better than a thousand months',
    'RELIGIOUS', 'LAYLAT_AL_QADR',
    1446, 9, 27, '27 Ramadan 1446', -- Traditionally observed on odd nights of last 10 days
    'ALL_AGES', true, true, 10,
    '["laylat_al_qadr", "night_of_power", "quran", "revelation", "worship"]',
    '[]',
    ARRAY['Understand the significance of Laylat al-Qadr', 'Increase worship and supplication', 'Seek forgiveness'],
    ARRAY['Night prayers', 'Quran recitation', 'Dua and dhikr', 'Community vigil'],
    true, true, true, true
),

-- Shawwal Events
(
    'Eid al-Fitr - Festival of Breaking Fast',
    'Joyous celebration marking the end of Ramadan fasting month',
    'RELIGIOUS', 'EID_FITR',
    1446, 10, 1, '1 Shawwal 1446',
    'ALL_AGES', true, true, 10,
    '["eid", "eid_al_fitr", "celebration", "family", "gratitude"]',
    '[]',
    ARRAY['Understand the significance of Eid', 'Practice gratitude and charity', 'Strengthen family bonds'],
    ARRAY['Eid prayers', 'Family gathering', 'Gift giving', 'Community celebration', 'Zakat al-Fitr'],
    true, true, true, true
),

-- Dhu al-Hijjah Events
(
    'Hajj - Pilgrimage to Mecca',
    'The annual Islamic pilgrimage to Mecca, one of the Five Pillars of Islam',
    'RELIGIOUS', 'HAJJ',
    1446, 12, 8, '8-13 Dhu al-Hijjah 1446',
    'ADULTS', true, true, 10,
    '["hajj", "pilgrimage", "mecca", "unity", "fifth_pillar"]',
    '[]',
    ARRAY['Learn about the rituals of Hajj', 'Understand the significance of pilgrimage', 'Connect with global Muslim community'],
    ARRAY['Hajj simulation activities', 'Educational presentations', 'Community prayers', 'Charity drives'],
    true, true, true, true
),

(
    'Eid al-Adha - Festival of Sacrifice',
    'Commemorating Prophet Ibrahim''s willingness to sacrifice his son in obedience to Allah',
    'RELIGIOUS', 'EID_ADHA',
    1446, 12, 10, '10 Dhu al-Hijjah 1446', 
    'ALL_AGES', true, true, 10,
    '["eid", "eid_al_adha", "sacrifice", "ibrahim", "obedience"]',
    '[]',
    ARRAY['Learn about Prophet Ibrahim''s sacrifice', 'Understand the concept of submission to Allah', 'Practice charity and sharing'],
    ARRAY['Eid prayers', 'Community feast', 'Qurbani (sacrifice)', 'Sharing with needy', 'Family time'],
    true, true, true, true
);

-- Update trigger for islamic_events
CREATE OR REPLACE FUNCTION update_islamic_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_islamic_events_updated_at
    BEFORE UPDATE ON islamic_events
    FOR EACH ROW
    EXECUTE FUNCTION update_islamic_events_updated_at();