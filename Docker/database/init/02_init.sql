-- Esta es la primera iteracion de la base de datos, se agregaran muchas mas cosas a medida que se vaya avanzando.
-- ATT: Alejandro

CREATE TABLE IF NOT EXISTS rol (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    full_name VARCHAR(180) NOT NULL,

    rol_id SMALLINT NOT NULL REFERENCES rol(id) ON DELETE RESTRICT DEFAULT 3,

    password_hash TEXT NOT NULL,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
