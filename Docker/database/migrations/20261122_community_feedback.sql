-- FORJA: evaluación comunitaria de una única respuesta por proyecto.
-- Migración aditiva e idempotente. Ejecutar con respaldo previo en BD existente.
BEGIN;

CREATE TABLE IF NOT EXISTS community_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INT NOT NULL UNIQUE REFERENCES project(id) ON DELETE RESTRICT,
  organization_name VARCHAR(200),
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_feedback
  ADD COLUMN IF NOT EXISTS relationship_to_project VARCHAR(300),
  ADD COLUMN IF NOT EXISTS consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS community_feedback_links (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INT NOT NULL UNIQUE REFERENCES project(id) ON DELETE RESTRICT,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_feedback_links_expires
  ON community_feedback_links(expires_at);
COMMIT;
