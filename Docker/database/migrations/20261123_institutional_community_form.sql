-- FORJA: sustituir el cuestionario provisional por el formulario institucional.
-- No modificar ni eliminar las evaluaciones de prueba ya recibidas (versión MVP_2026).
-- Nueva evaluación por semestre: versión INSTITUCIONAL_2026 y respuestas JSONB.
BEGIN;
ALTER TABLE community_period_feedback
  ADD COLUMN IF NOT EXISTS form_version VARCHAR(32) NOT NULL DEFAULT 'MVP_2026',
  ADD COLUMN IF NOT EXISTS form_responses JSONB;
COMMIT;
