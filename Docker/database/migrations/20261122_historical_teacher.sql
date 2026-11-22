-- Ampliación segura: nombre del docente de un período histórico.
-- Si el profesor de un semestre antiguo ya no tiene cuenta en FORJA,
-- conservamos su nombre conocido sin crear usuarios ficticios.
-- Idempotente; no borra registros ni documentos.
BEGIN;
ALTER TABLE project_periods
  ADD COLUMN IF NOT EXISTS historical_teacher_name VARCHAR(180);
COMMIT;
