-- IDs 1, 2 y 3 en una base nueva; users usa teacher (3) por defecto.
INSERT INTO rol (name)
VALUES ('admin'), ('evaluator'), ('teacher')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (username, email, full_name, password_hash, rol_id)
VALUES (
    'admin',
    'admin@example.com',
    'Administrador FORJA',
    '$2b$12$g5QciLySYrY6fwNbngZNGO.vbAKvhUnhZ8BU6cJuoInkadER3fTy.', -- la clave es 123
    (SELECT id FROM rol WHERE name = 'admin')
);
