-- FORJA: siete zonas territoriales institucionales y compromisos de sostenibilidad.
-- El catálogo de zonas ya existe en las instalaciones previas; estos CREATE son
-- idempotentes. No se inventan nombres hasta que FORJA entregue el catálogo oficial.
-- No sustituye los ODS existentes (ods_ids); compromisos es catálogo diferente.
BEGIN;

CREATE TABLE IF NOT EXISTS forja_territories (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS project_territories (
  project_id INT NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  territory_id SMALLINT NOT NULL REFERENCES forja_territories(id) ON DELETE RESTRICT,
  PRIMARY KEY(project_id,territory_id)
);

CREATE TABLE IF NOT EXISTS forja_sustainability_commitments (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(180) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS project_sustainability_commitments (
  project_id INT NOT NULL REFERENCES project(id) ON DELETE RESTRICT,
  commitment_id SMALLINT NOT NULL REFERENCES forja_sustainability_commitments(id) ON DELETE RESTRICT,
  PRIMARY KEY(project_id,commitment_id)
);

CREATE INDEX IF NOT EXISTS idx_project_territories_zone ON project_territories(territory_id,project_id);
CREATE INDEX IF NOT EXISTS idx_project_sustainability_commitments_filter
  ON project_sustainability_commitments(commitment_id,project_id);
COMMIT;
