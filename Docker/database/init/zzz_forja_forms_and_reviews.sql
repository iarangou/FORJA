-- FORJA - segunda etapa: datos del formulario y revision por semestre.
-- Ejecutar DESPUES de zz_forja_project_core.sql. Ninguna tabla existente se elimina.
-- En bases previamente inicializadas se requiere una migracion manual y backup.
BEGIN;

ALTER TABLE project
  ADD COLUMN IF NOT EXISTS community_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS community_contact VARCHAR(180),
  ADD COLUMN IF NOT EXISTS community_location TEXT,
  ADD COLUMN IF NOT EXISTS justification TEXT,
  ADD COLUMN IF NOT EXISTS prior_project_id INT REFERENCES project(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS ods_ids SMALLINT[] NOT NULL DEFAULT '{}';

ALTER TABLE project_periods
  ADD COLUMN IF NOT EXISTS faculty_id INT REFERENCES faculty(id),
  ADD COLUMN IF NOT EXISTS academic_program_id INT REFERENCES academic_programs(id),
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS budget_description TEXT,
  ADD COLUMN IF NOT EXISTS student_participation_description TEXT,
  ADD COLUMN IF NOT EXISTS community_population_description TEXT,
  ADD COLUMN IF NOT EXISTS territory_name TEXT,
  ADD COLUMN IF NOT EXISTS last_submitted_at TIMESTAMPTZ,
  ADD CONSTRAINT chk_project_periods_dates
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

CREATE TABLE IF NOT EXISTS project_period_courses (
  project_period_id BIGINT NOT NULL REFERENCES project_periods(id) ON DELETE RESTRICT,
  course_id INT NOT NULL REFERENCES course(id) ON DELETE RESTRICT,
  PRIMARY KEY (project_period_id, course_id)
);

-- Un solo analisis etico activo por proyecto, con los datos generales reutilizados.
-- Las categorias se guardan como codigos, no como informacion personal nominativa.
CREATE TABLE IF NOT EXISTS project_ethics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INT NOT NULL UNIQUE REFERENCES project(id) ON DELETE RESTRICT,
  external_population VARCHAR(80),
  university_population VARCHAR(80),
  external_population_other TEXT,
  university_population_other TEXT,
  handles_personal_data BOOLEAN,
  involves_vulnerable_population BOOLEAN,
  identifiable_media BOOLEAN,
  privacy_measures TEXT,
  risk_mitigation TEXT,
  permission_required BOOLEAN NOT NULL DEFAULT FALSE,
  permission_document_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  truthful_declaration BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  requested_at TIMESTAMPTZ,
  updated_by INT NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_period_id BIGINT NOT NULL REFERENCES project_periods(id) ON DELETE RESTRICT,
  document_kind VARCHAR(45) NOT NULL CHECK (document_kind IN
    ('AVAL_ORGANIZACION','AUTORIZACION_IMAGEN','PLAN_ADJUNTO',
     'EVIDENCIA','CARTA_FIRMADA','OTRO')),
  original_filename VARCHAR(255) NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  review_status VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (review_status IN ('PENDIENTE','DEVUELTA','APROBADA')),
  uploaded_by INT NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by INT REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_project_documents_period ON project_documents(project_period_id);
CREATE TABLE IF NOT EXISTS project_period_reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_period_id BIGINT NOT NULL REFERENCES project_periods(id) ON DELETE RESTRICT,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision VARCHAR(10) NOT NULL CHECK (decision IN ('APROBADO','DEVUELTO')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_period_reviews_period ON project_period_reviews(project_period_id);

-- El formulario comunitario se diligencia una vez por proyecto (reunion FORJA).
-- Guardar un hash/token fuerte, NO un enlace publico con solo el codigo FORJA.
CREATE TABLE IF NOT EXISTS community_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INT NOT NULL UNIQUE REFERENCES project(id) ON DELETE RESTRICT,
  organization_name VARCHAR(200),
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- El catalogo de territorios solo se completara cuando existan los siete nombres oficiales.
CREATE TABLE IF NOT EXISTS forja_territories (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS project_territories (
  project_id INT NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  territory_id SMALLINT NOT NULL REFERENCES forja_territories(id) ON DELETE RESTRICT,
  PRIMARY KEY(project_id, territory_id)
);

COMMIT;
