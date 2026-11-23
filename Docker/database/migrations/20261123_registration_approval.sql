-- Flujo de autorregistro: verificación de correo + revisión administrativa.
-- Aditiva: cuentas actuales quedan aprobadas para no interrumpir logins existentes.
BEGIN;
ALTER TABLE users
 ADD COLUMN IF NOT EXISTS registration_status VARCHAR(16) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_registration_status_check;
ALTER TABLE users ADD CONSTRAINT users_registration_status_check
 CHECK (registration_status IN ('PENDING','APPROVED'));
CREATE INDEX IF NOT EXISTS idx_users_pending_registration
 ON users(registration_status,is_active) WHERE registration_status='PENDING';
COMMIT;
