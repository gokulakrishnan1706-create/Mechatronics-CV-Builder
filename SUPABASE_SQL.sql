-- ============================================================
-- GokulCV — CV Version Control Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- 1. Add ATS score columns to existing saved_cvs table
ALTER TABLE saved_cvs ADD COLUMN IF NOT EXISTS ats_score INTEGER;
ALTER TABLE saved_cvs ADD COLUMN IF NOT EXISTS ats_sector TEXT;
ALTER TABLE saved_cvs ADD COLUMN IF NOT EXISTS ats_job_type TEXT;
ALTER TABLE saved_cvs ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- 2. Create cv_versions table for full version history
CREATE TABLE IF NOT EXISTS cv_versions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_cv_id     UUID REFERENCES saved_cvs(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL DEFAULT 1,
  cv_data         JSONB NOT NULL,
  sector          TEXT,
  ats_score       INTEGER,
  ats_job_type    TEXT,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on cv_versions
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own CV versions"
ON cv_versions FOR ALL
USING (auth.uid() = user_id);

-- 4. Create ats_scans table to track scan history per user
CREATE TABLE IF NOT EXISTS ats_scans (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score         INTEGER NOT NULL,
  job_type      TEXT,
  sector        TEXT,
  matched_count INTEGER,
  missing_count INTEGER,
  job_title     TEXT,
  company_hint  TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ats_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own ATS scans"
ON ats_scans FOR ALL
USING (auth.uid() = user_id);
