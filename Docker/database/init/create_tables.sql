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

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

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

-- CREATE TABLE IF NOT EXISTS project_ods (
--     project_id BIGINT NOT NULL REFERENCES projects(id),
--     ods_id BIGINT NOT NULL REFERENCES sustainable_development_goals(id),

--     PRIMARY KEY (project_id, ods_id)
-- );

-- CREATE TABLE IF NOT EXISTS project_period_programs (
--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     academic_program_id BIGINT NOT NULL
--         REFERENCES academic_programs(id),

--     PRIMARY KEY (project_period_id, academic_program_id)
-- );

-- CREATE TABLE IF NOT EXISTS program_subjects (
--     academic_program_id BIGINT NOT NULL
--         REFERENCES academic_programs(id),

--     subject_id BIGINT NOT NULL
--         REFERENCES subjects(id),

--     PRIMARY KEY (academic_program_id, subject_id)
-- );

-- CREATE TABLE IF NOT EXISTS project_reviews (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     reviewer_user_id BIGINT NOT NULL
--         REFERENCES users(id),

--     status SMALLINT NOT NULL DEFAULT 1
--         CHECK (status BETWEEN 1 AND 4),

--     comments TEXT,

--     reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE project_files (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     file_name VARCHAR(255) NOT NULL,

--     file_key TEXT NOT NULL UNIQUE,

--     file_type VARCHAR(100) NOT NULL,

--     file_size BIGINT NOT NULL
--         CHECK (file_size >= 0),

--     category SMALLINT NOT NULL
--         CHECK (category BETWEEN 1 AND 4),

--     uploaded_by BIGINT
--         REFERENCES users(id),

--     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE project_status_history (
--     id BIGSERIAL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_id BIGINT NOT NULL
--         REFERENCES projects(id),

--     previous_status SMALLINT
--         CHECK (previous_status BETWEEN 1 AND 3),

--     new_status SMALLINT NOT NULL
--         CHECK (new_status BETWEEN 1 AND 3),

--     changed_by_user_id BIGINT NOT NULL
--         REFERENCES users(id),

--     comments TEXT,

--     changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE questionnaire_links (
--     id BIGSERIAL PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     token_hash VARCHAR(255) NOT NULL UNIQUE,

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     expires_at TIMESTAMP,

--     used_at TIMESTAMP,

--     is_active BOOLEAN DEFAULT TRUE
-- );

-- CREATE TABLE community_questionnaires (
--     id BIGSERIAL PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     questionnaire_link_id BIGINT NOT NULL UNIQUE
--         REFERENCES questionnaire_links(id),

--     leader_name VARCHAR(60),

--     responses JSONB NOT NULL,

--     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE project_letters (
--     id BIGSERIAL PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     project_file_id BIGINT NOT NULL UNIQUE
--         REFERENCES project_files(id),

--     document_type VARCHAR(100),

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE certificates (
--     id BIGSERIAL PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id),

--     professor_id BIGINT NOT NULL
--         REFERENCES professors(id),

--     project_file_id BIGINT NOT NULL UNIQUE
--         REFERENCES project_files(id),

--     verification_code VARCHAR(100) NOT NULL UNIQUE,

--     issued_by_user_id BIGINT
--         REFERENCES users(id),

--     issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     UNIQUE (project_period_id, professor_id)
-- );

