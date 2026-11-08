-- IDs 1, 2 y 3 en una base nueva; users usa teacher (3) por defecto.
INSERT INTO rol (name)
VALUES ('admin'), ('evaluator'), ('teacher')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (username, email, full_name, password_hash, rol_id)
VALUES (
    'admin',
    'admin@javerianacali.edu.co',
    'Administrador FORJA',
    '$2b$12$sVQZbyrSSS6s0IWJN10bMOTfI55ecvLjTOleQsU6mUkHYHG1gdpE2', -- la clave es 12345678
    (SELECT id FROM rol WHERE name = 'admin')
);
