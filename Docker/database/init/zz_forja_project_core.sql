-- FORJA - primera migración no destructiva de proyectos.
-- Se ejecuta automáticamente solo en una base PostgreSQL NUEVA porque está
-- dentro de /docker-entrypoint-initdb.d/ (orden: create_tables, insert_values, zz...).
-- En una base existente debe ejecutarse expresamente después de hacer backup.

BEGIN;

-- Se conserva el ID de rol 2; la aplicación lo utiliza para monitor.
UPDATE rol SET name = 'monitor'
WHERE name = 'evaluator'
  AND NOT EXISTS (SELECT 1 FROM rol WHERE name = 'monitor');

ALTER TABLE project
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS general_problem TEXT,
  ADD COLUMN IF NOT EXISTS general_objective TEXT,
  ADD COLUMN IF NOT EXISTS registration_type VARCHAR(12) NOT NULL DEFAULT 'NUEVO',
  ADD COLUMN IF NOT EXISTS general_status VARCHAR(12) NOT NULL DEFAULT 'ACTIVO';

-- Asignar códigos a proyectos históricos ya registrados sin borrar sus datos.
UPDATE project
SET code = 'FORJA-' || LPAD(id::text, 8, '0')
WHERE code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_project_code ON project (code);
ALTER TABLE project ALTER COLUMN code SET NOT NULL;

-- La secuencia permite generar códigos únicos sin consultar el último ID.
CREATE SEQUENCE IF NOT EXISTS forja_project_code_seq;
SELECT setval(
  'forja_project_code_seq',
  GREATEST((SELECT COALESCE(MAX(id), 0) FROM project), 1),
  EXISTS(SELECT 1 FROM project)
);
ALTER TABLE project ALTER COLUMN code
  SET DEFAULT ('FORJA-' || LPAD(nextval('forja_project_code_seq')::text, 8, '0'));

-- Los estados de aprobación pertenecen a cada semestre, NO al proyecto general.
CREATE TABLE IF NOT EXISTS project_periods (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INT NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  academic_year SMALLINT NOT NULL CHECK (academic_year BETWEEN 1900 AND 2200),
  academic_semester SMALLINT NOT NULL CHECK (academic_semester IN (1, 2)),
  teacher_id INT REFERENCES teacher(id) ON DELETE RESTRICT,
  course_id INT REFERENCES course(id) ON DELETE RESTRICT,
  objectives TEXT,
  activities TEXT,
  budget NUMERIC(14,2) CHECK (budget >= 0),
  student_count INT CHECK (student_count >= 0),
  results TEXT,
  conclusions TEXT,
  approval_status VARCHAR(15) NOT NULL DEFAULT 'BORRADOR'
    CHECK (approval_status IN ('BORRADOR', 'EN_REVISION', 'DEVUELTO', 'APROBADO')),
  execution_status VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (execution_status IN ('PENDIENTE', 'EN_CURSO', 'CERRADO')),
  record_type VARCHAR(10) NOT NULL DEFAULT 'ACTUAL'
    CHECK (record_type IN ('ACTUAL', 'HISTORICO')),
  missing_information TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_academic_period UNIQUE(project_id, academic_year, academic_semester)
);

CREATE INDEX IF NOT EXISTS idx_project_periods_project ON project_periods(project_id);
CREATE INDEX IF NOT EXISTS idx_project_periods_teacher ON project_periods(teacher_id);
CREATE INDEX IF NOT EXISTS idx_project_periods_approval ON project_periods(approval_status);

COMMIT;
