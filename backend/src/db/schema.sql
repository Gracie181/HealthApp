-- Curated OTC medicine table. Must be reviewed by a pharmacist or clinician.
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  generic_name TEXT NOT NULL,
  category TEXT NOT NULL,
  used_for TEXT NOT NULL,
  label_dosing TEXT NOT NULL,
  min_age_years NUMERIC DEFAULT 0,
  avoid_pregnancy BOOLEAN DEFAULT TRUE,
  avoid_conditions TEXT[] DEFAULT '{}',
  avoid_with TEXT[] DEFAULT '{}',
  notes TEXT,
  reviewed_by TEXT,
  reviewed_on DATE
);

CREATE TABLE IF NOT EXISTS red_flags (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  reason TEXT NOT NULL
);

-- Keep minimal: no names or exact locations (Kenya Data Protection Act).
CREATE TABLE IF NOT EXISTS checks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  age_group TEXT,
  urgency TEXT
);