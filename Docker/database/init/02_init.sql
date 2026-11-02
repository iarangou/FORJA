-- Esta es la primera iteracion de la base de datos, se agregaran muchas mas cosas a medida que se vaya avanzando.
-- ATT: Alejandro

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    full_name VARCHAR(180) NOT NULL,

    password_hash TEXT,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (username, email, full_name, password_hash)
VALUES (
    'admin',
    'admin@example.com',
    'Administrador FORJA',
    '$2b$12$g5QciLySYrY6fwNbngZNGO.vbAKvhUnhZ8BU6cJuoInkadER3fTy.' -- la clave es 123
);