-- Esta es la primera iteracion de la base de datos, se agregaran muchas mas cosas a medida que se vaya avanzando.
-- ATT: Alejandro

CREATE TABLE IF NOT EXISTS rol (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS faculty (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT faculty_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS course (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT course_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    full_name VARCHAR(180) NOT NULL,

    rol_id SMALLINT NOT NULL REFERENCES rol(id) ON DELETE RESTRICT DEFAULT 3,

    password_hash TEXT NOT NULL,

    active BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    faculty_id SMALLINT NOT NULL REFERENCES faculty(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE TABLE IF NOT EXISTS academic_periods (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     year INT NOT NULL,
--     semester INT NOT NULL CHECK (semester IN (1, 2)),
--     is_active BOOLEAN DEFAULT TRUE,
--     UNIQUE (year, semester)
-- );

-- CREATE TABLE IF NOT EXISTS academic_programs (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     code VARCHAR(30) UNIQUE,
--     name VARCHAR(60) NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE
-- );

-- CREATE TABLE IF NOT EXISTS communities (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     name VARCHAR(80) NOT NULL,
--     location VARCHAR(50),
--     description TEXT,
--     is_active BOOLEAN DEFAULT TRUE
-- );

-- CREATE TABLE IF NOT EXISTS sustainable_development_goals (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     goal_number INT NOT NULL UNIQUE
--         CHECK (goal_number BETWEEN 1 AND 17),
--     name VARCHAR(50) NOT NULL,
--     description TEXT
-- );

-- CREATE TABLE IF NOT EXISTS projects (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     code VARCHAR(30) NOT NULL UNIQUE,
--     name VARCHAR(30) NOT NULL,
--     description TEXT,
--     general_problem TEXT,
--     general_objective TEXT,
--     community_id BIGINT REFERENCES communities(id),
--     project_status_id BIGINT REFERENCES project_statuses(id),
--     registration_type VARCHAR(20) NOT NULL DEFAULT 'NEW'
--         CHECK (registration_type IN ('NEW', 'HISTORICAL')),
--     is_public BOOLEAN NOT NULL DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS project_periods (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_id BIGINT NOT NULL REFERENCES projects(id),
--     academic_period_id BIGINT NOT NULL
--         REFERENCES academic_periods(id),
--     professor_id BIGINT NOT NULL REFERENCES professors(id),
--     subject_id BIGINT REFERENCES subjects(id),
--     start_date DATE,
--     end_date DATE,
--     specific_objectives TEXT,
--     activities TEXT,
--     budget NUMERIC(14, 2),
--     student_count INT CHECK (student_count >= 0),
--     results TEXT,
--     conclusions TEXT,
--     review_status_id BIGINT REFERENCES review_statuses(id),
--     execution_status_id BIGINT REFERENCES execution_statuses(id),
--     observations TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE (project_id, academic_period_id)
-- );

