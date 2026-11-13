CREATE TABLE IF NOT EXISTS docker_test (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO docker_test (message)
VALUES ('Base de datos FORJA funcionando, claro que si');