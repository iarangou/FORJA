-- FORJA: zonas territoriales y departamento académico de los estudiantes.
-- Los 17 Objetivos de Desarrollo Sostenible se almacenan en project.ods_ids.
-- Corrige la migración anterior que duplicaba los ODS como "compromisos".
-- No elimina tablas ni datos existentes; idempotente para bases ya inicializadas.
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
CREATE INDEX IF NOT EXISTS idx_project_territories_zone ON project_territories(territory_id,project_id);

ALTER TABLE project_periods ADD COLUMN IF NOT EXISTS department_id INT REFERENCES department(id);
CREATE INDEX IF NOT EXISTS idx_project_periods_department ON project_periods(department_id);

-- Los catálogos antiguos de compromisos, si fueron creados, se dejan intactos
-- por seguridad pero la app ya no los utiliza.
COMMIT;
