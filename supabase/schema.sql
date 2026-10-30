-- CampusFix — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor to initialize the database.
-- CampusFix auto-seeds with 36 campus reports on first API call if the table is empty.
-- All reports use the CF-XXXX ticket ID prefix (Science Block: CF-101 to CF-110,
-- Central Library: CF-201 to CF-208, Student Dorms: CF-301 to CF-307, Scattered: CF-401 to CF-603).

-- ─── Main Reports Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS civic_reports (
  id                  TEXT         PRIMARY KEY,
  title               TEXT         NOT NULL,
  description         TEXT         NOT NULL,
  category            TEXT         NOT NULL
                      CHECK (category IN ('IT_INFRA','PLUMBING','ELECTRICAL','HVAC','SANITATION','FURNITURE')),
  latitude            NUMERIC(10,7) NOT NULL,
  longitude           NUMERIC(10,7) NOT NULL,
  address             TEXT         NOT NULL,
  status              TEXT         NOT NULL DEFAULT 'SUBMITTED'
                      CHECK (status IN ('SUBMITTED','AI_TRIAGED','DISPATCHED','IN_PROGRESS','RESOLVED','CLOSED')),
  priority_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  priority_label      TEXT         NOT NULL DEFAULT 'UNKNOWN'
                      CHECK (priority_label IN ('CRITICAL','HIGH','MEDIUM','LOW','UNKNOWN')),
  priority_factors    JSONB        NOT NULL DEFAULT '{}',
  ai_summary          TEXT,
  ai_reasoning        TEXT,
  assigned_department TEXT,
  dispatch_notes      TEXT,
  duplicate_of_id     TEXT         REFERENCES civic_reports(id) ON DELETE SET NULL,
  duplicate_count     INTEGER      NOT NULL DEFAULT 1,
  duplicate_similarity NUMERIC(5,4) NOT NULL DEFAULT 0,
  image_base64        TEXT,
  reporter_name       TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_civic_reports_status
  ON civic_reports(status);

CREATE INDEX IF NOT EXISTS idx_civic_reports_priority
  ON civic_reports(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_civic_reports_category
  ON civic_reports(category);

CREATE INDEX IF NOT EXISTS idx_civic_reports_created
  ON civic_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_civic_reports_duplicate_of
  ON civic_reports(duplicate_of_id)
  WHERE duplicate_of_id IS NOT NULL;

-- ─── Auto-update updated_at Trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON civic_reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON civic_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security (recommended for production) ─────────────────────────
-- Enable RLS and allow public reads for the hackathon demo.
-- Tighten these policies before deploying to production.
ALTER TABLE civic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON civic_reports FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access"
  ON civic_reports FOR ALL
  USING (auth.role() = 'service_role');
