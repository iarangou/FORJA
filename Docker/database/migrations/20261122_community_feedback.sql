-- FORJA: una evaluación comunitaria por período académico (semestre).
-- Migración aditiva e idempotente: NO elimina ni modifica datos anteriores.
-- Incluso si se aplicó una versión anterior por proyecto, sus tablas se conservan.
-- Realizar un respaldo antes de aplicarla en una base existente.
BEGIN;

CREATE TABLE IF NOT EXISTS community_period_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_period_id BIGINT NOT NULL UNIQUE
    REFERENCES project_periods(id) ON DELETE RESTRICT,
  organization_name VARCHAR(200),
  relationship_to_project VARCHAR(300),
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  comments TEXT,
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_period_feedback_links (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_period_id BIGINT NOT NULL UNIQUE
    REFERENCES project_periods(id) ON DELETE RESTRICT,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_period_feedback_links_expires
  ON community_period_feedback_links(expires_at);
COMMIT;
