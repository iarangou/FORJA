-- IDs 1, 2 y 3 en una base nueva; users usa teacher (3) por defecto.
INSERT INTO rol (name)
VALUES ('admin'), ('evaluator'), ('teacher');

INSERT INTO faculty (name, code)
VALUES 
    ('Ciencias Económicas y Administrativas', 'FCEA'), --    FCEA        01  1980
    ('Ingeniería y Ciencias', 'FIC'), --                    FIC         02  1984
    ('Humanidades y Ciencias Sociales', 'FHCS'), --          FHCS        03  1985
    ('Ciencias de la Salud', 'FCS'), --                     FCS         04  2008
    ('Creación y Hábitat', 'FCH'); --                       FCH         05  2020

INSERT INTO academic_programs (name, faculty_id)
VALUES
    -- Facultad de Ciencias Económicas y Administrativas (FCEA)
    ('Administración de Empresas', 1),
    ('Economía', 1),
    ('Finanzas', 1),
    ('Mercadeo', 1),
    ('Negocios Internacionales', 1),

    -- Facultad de Ingeniería y Ciencias (FIC)
    ('Biología', 2),
    ('Ingeniería Biomédica', 2),
    ('Ingeniería Civil', 2),
    ('Ingeniería de Sistemas y Computación', 2),
    ('Ingeniería Electrónica', 2),
    ('Ingeniería Industrial', 2),
    ('Ingeniería Matemática', 2),
    ('Ingeniería Mecánica', 2),
    ('Ingeniería Robótica', 2),

    -- Facultad de Humanidades y Ciencias Sociales (FHCS)
    ('Ciencia Política', 3),
    ('Comunicación', 3),
    ('Derecho', 3),
    ('Filosofía', 3),
    ('Producción Audiovisual Interactiva', 3),
    ('Psicología', 3),

    -- Facultad de Ciencias de la Salud (FCS)
    ('Enfermería', 4),
    ('Medicina', 4),
    ('Nutrición y Dietética', 4),

    -- Facultad de Creación y Hábitat (FCH)
    ('Arquitectura', 5),
    ('Artes Visuales', 5),
    ('Diseño de Comunicación Visual', 5),
    ('Gastronomía y Artes Culinarias', 5);
    -- ('Tecnología en Danza y Artes del Movimiento', 5);


INSERT INTO users (username, email, full_name, password_hash, rol_id, is_active)
VALUES (
    'admin',
    'admin@javerianacali.edu.co',
    'Administrador FORJA',
    '$2b$12$sVQZbyrSSS6s0IWJN10bMOTfI55ecvLjTOleQsU6mUkHYHG1gdpE2', -- la clave es 12345678
    (SELECT id FROM rol WHERE name = 'admin'),
    TRUE
);

INSERT INTO users (username, email, full_name, password_hash)
VALUES ('vctrmrtnz', 'vctrmrtnz@javerianacali.edu.co', 'Víctor Martínez', '$2b$12$sVQZbyrSSS6s0IWJN10bMOTfI55ecvLjTOleQsU6mUkHYHG1gdpE2');

-- INSERT INTO teacher (user_id, faculty_id)
-- VALUES (
--     (SELECT id FROM users WHERE username = 'vctrmrtnz'),
--     1
-- );