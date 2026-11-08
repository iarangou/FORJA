INSERT INTO users (username, email, full_name, password_hash, rol_id)
VALUES (
    'admin',
    'admin@example.com',
    'Administrador FORJA',
    '$2b$12$g5QciLySYrY6fwNbngZNGO.vbAKvhUnhZ8BU6cJuoInkadER3fTy.', -- la clave es 123
    1
);

INSERT INTO rol (name)
VALUES (
    ('admin'),
    ('evaluator'),
    ('teacher'),
)