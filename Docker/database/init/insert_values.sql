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

INSERT INTO department (name, faculty_id)
VALUES
    -- Facultad de Ciencias Económicas y Administrativas (FCEA)
    ('Economía y Finanzas', 1),
    ('Gestión de Organizaciones', 1),
    ('Mercadeo y Negocios', 1),

    -- Facultad de Ingeniería y Ciencias (FIC)
    ('Ciencias Naturales y Matemáticas', 2),
    ('Electrónica y Ciencias de la Computación', 2),
    ('Ingeniería Civil e Industrial', 2),

    -- Facultad de Humanidades y Ciencias Sociales (FHCS)
    ('Ciencia Jurídica y Política', 3),
    ('Ciencias Sociales', 3),
    ('Comunicación y Lenguaje', 3),
    ('Humanidades', 3),

    -- Facultad de Ciencias de la Salud (FCS)
    ('Alimentación y Nutrición', 4),
    ('Ciencias Básicas de la Salud', 4),
    ('Clínicas Médicas', 4),
    ('Clínicas Quirúrgicas', 4),
    ('Cuidado de Enfermería', 4),
    ('Materno Infantil', 4),
    ('Salud Pública y Epidemiología', 4),

    -- Facultad de Creación y Hábitat (FCH)
    ('Creación', 5),
    ('Hábitat', 5);

INSERT INTO academic_programs (name, snies_code, faculty_id)
VALUES
    -- Facultad de Ciencias Económicas y Administrativas (FCEA)
    ('Administración de Empresas', '1040', 1),
    ('Economía', '10233', 1),
    ('Finanzas', '107941', 1),
    ('Mercadeo', '108255', 1),
    ('Negocios Internacionales', '101827', 1),

    -- Facultad de Ingeniería y Ciencias (FIC)
    ('Biología', '54562', 2),
    ('Ingeniería Biomédica', '108767', 2),
    ('Ingeniería Civil', '8114', 2),
    ('Ingeniería de Sistemas y Computación', '1042', 2),
    ('Ingeniería Electrónica', '1043', 2),
    ('Ingeniería Industrial', '1044', 2),
    ('Ingeniería Matemática', '53052', 2),
    ('Ingeniería Mecánica', '106932', 2),
    ('Ingeniería Robótica', '119340', 2),

    -- Facultad de Humanidades y Ciencias Sociales (FHCS)
    ('Ciencia Política', '11648', 3),
    ('Comunicación', '15808', 3),
    ('Derecho', '10213', 3),
    ('Filosofía', '54163', 3),
    ('Producción Audiovisual Interactiva', '116766', 3),
    ('Psicología', '1039', 3),

    -- Facultad de Ciencias de la Salud (FCS)
    ('Enfermería', '106123', 4),
    ('Medicina', '54936', 4),
    ('Nutrición y Dietética', '105688', 4),

    -- Facultad de Creación y Hábitat (FCH)
    ('Arquitectura', '90368', 5),
    ('Artes Visuales', '53475', 5),
    ('Diseño de Comunicación Visual', '53296', 5),
    ('Gastronomía y Artes Culinarias', '108766', 5),
    ('Tecnología en Danza y Artes del Movimiento', '117055', 5);


-- Los usuarios de demostración con contraseñas compartidas se eliminaron del seed.
-- Registrar el primer administrador de forma segura con scripts/bootstrap-admin.mjs.
-- No usar contraseñas conocidas ni almacenar hashes de pruebas en Git.
