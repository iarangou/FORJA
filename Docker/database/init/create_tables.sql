CREATE TABLE IF NOT EXISTS rol (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculty (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    faculty_id INT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_department_name UNIQUE(name, faculty_id),

    CONSTRAINT fk_department_faculty FOREIGN KEY(faculty_id)
        REFERENCES faculty(id)
);

CREATE TABLE IF NOT EXISTS academic_programs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    snies_code VARCHAR(25),

    faculty_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_academic_programs_name UNIQUE(name),
    CONSTRAINT uq_academic_programs_snies_code UNIQUE(snies_code),
    CONSTRAINT fk_academic_programs_faculty FOREIGN KEY(faculty_id)
        REFERENCES faculty(id)
);

CREATE TABLE IF NOT EXISTS course (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_course_name UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    full_name VARCHAR(180) NOT NULL,

    rol_id INT NOT NULL DEFAULT 3,

    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_username UNIQUE(username),
    CONSTRAINT uq_email UNIQUE(email),
    CONSTRAINT fk_rol_id FOREIGN KEY(rol_id)
        REFERENCES rol(id)
);

CREATE TABLE IF NOT EXISTS teacher (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    faculty_id INT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_id UNIQUE(user_id),

    CONSTRAINT fk_teacher_user_id FOREIGN KEY(user_id)
        REFERENCES users(id),

    CONSTRAINT fk_teacher_faculty_id FOREIGN KEY(faculty_id)
        REFERENCES faculty(id)
);

CREATE TABLE IF NOT EXISTS project (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    duration INT,
    start_date DATE,
    end_date DATE,

    created_by INT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- CONSTRAINT uq_project_code UNIQUE(code),
    CONSTRAINT ck_project_duration CHECK(
        duration IN (1, 2)
    ),

    CONSTRAINT ck_project_dates CHECK(
        end_date >= start_date
    ),

    -- CONSTRAINT fk_project_faculty FOREIGN KEY(faculty_id)
        -- REFERENCES faculty(id),

    -- CONSTRAINT fk_project_department FOREIGN KEY(department_id)
        -- REFERENCES department(id),

    -- CONSTRAINT fk_project_academic_program FOREIGN KEY(academic_program_id)
        -- REFERENCES academic_programs(id),

    CONSTRAINT fk_project_created_by FOREIGN KEY(created_by)
        REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_teacher (
    project_id INT NOT NULL,
    teacher_id INT NOT NULL,

    is_responsible BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_project_teacher PRIMARY KEY(project_id, teacher_id),

    CONSTRAINT fk_project_teacher_project FOREIGN KEY(project_id)
        REFERENCES project(id),

    CONSTRAINT fk_project_teacher_teacher FOREIGN KEY(teacher_id)
        REFERENCES teacher(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_responsible_teacher
    ON project_teacher(project_id) 
        WHERE is_responsible = TRUE;

-- CREATE TABLE IF NOT EXISTS projects (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     code VARCHAR(30) NOT NULL UNIQUE,
--     name VARCHAR(200) NOT NULL,

--     description TEXT,
--     general_problem TEXT,
--     general_objective TEXT,

--     community_id BIGINT
--         REFERENCES communities(id) ON DELETE RESTRICT,

--     status SMALLINT NOT NULL DEFAULT 1
--         CHECK (status BETWEEN 1 AND 3),

--     registration_type VARCHAR(20) NOT NULL DEFAULT 'NEW'
--         CHECK (registration_type IN ('NEW', 'HISTORICAL')),

--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );


-- CREATE TABLE IF NOT EXISTS project_periods (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_id BIGINT NOT NULL
--         REFERENCES projects(id) ON DELETE CASCADE,

--     academic_period VARCHAR(7) NOT NULL
--         CHECK (academic_period ~ '^[0-9]{4}-0[12]$'),

--     teacher_id BIGINT NOT NULL
--         REFERENCES teacher(id) ON DELETE RESTRICT,

--     faculty_id SMALLINT NOT NULL
--         REFERENCES faculty(id) ON DELETE RESTRICT,

--     course_id SMALLINT NOT NULL
--         REFERENCES course(id) ON DELETE RESTRICT,

--     start_date DATE,
--     end_date DATE,

--     specific_objectives TEXT,
--     activities TEXT,

--     budget NUMERIC(14, 2)
--         CHECK (budget >= 0),

--     student_count INT
--         CHECK (student_count >= 0),

--     beneficiary_count INT
--         CHECK (beneficiary_count >= 0),

--     results TEXT,
--     conclusions TEXT,
--     observations TEXT,

--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--     CONSTRAINT project_period_dates_check
--         CHECK (
--             start_date IS NULL
--             OR end_date IS NULL
--             OR end_date >= start_date
--         ),

--     CONSTRAINT project_period_unique
--         UNIQUE (project_id, academic_period)
-- );


-- CREATE TABLE IF NOT EXISTS project_ods (
--     project_id BIGINT NOT NULL
--         REFERENCES projects(id) ON DELETE CASCADE,

--     ods_id SMALLINT NOT NULL
--         REFERENCES sustainable_development_goals(id)
--         ON DELETE RESTRICT,

--     PRIMARY KEY (project_id, ods_id)
-- );


-- CREATE TABLE IF NOT EXISTS project_reviews (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id) ON DELETE CASCADE,

--     reviewer_user_id BIGINT NOT NULL
--         REFERENCES users(id) ON DELETE RESTRICT,

--     status SMALLINT NOT NULL
--         CHECK (status IN (1, 2)),

--     comments TEXT,

--     reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );


-- CREATE TABLE IF NOT EXISTS project_files (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id) ON DELETE CASCADE,

--     file_name VARCHAR(255) NOT NULL,
--     file_key TEXT NOT NULL UNIQUE,
--     file_type VARCHAR(100) NOT NULL,

--     file_size BIGINT NOT NULL
--         CHECK (file_size >= 0),

--     category SMALLINT NOT NULL
--         CHECK (category BETWEEN 1 AND 4),

--     uploaded_by BIGINT
--         REFERENCES users(id) ON DELETE SET NULL,

--     uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );


-- CREATE TABLE IF NOT EXISTS project_status_history (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_id BIGINT NOT NULL
--         REFERENCES projects(id) ON DELETE CASCADE,

--     previous_status SMALLINT
--         CHECK (previous_status BETWEEN 1 AND 3),

--     new_status SMALLINT NOT NULL
--         CHECK (new_status BETWEEN 1 AND 3),

--     changed_by_user_id BIGINT
--         REFERENCES users(id) ON DELETE SET NULL,

--     comments TEXT,

--     changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );


-- CREATE TABLE IF NOT EXISTS questionnaire_links (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id) ON DELETE CASCADE,

--     token_hash VARCHAR(255) NOT NULL UNIQUE,

--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     expires_at TIMESTAMPTZ,
--     used_at TIMESTAMPTZ,

--     is_active BOOLEAN NOT NULL DEFAULT TRUE,

--     CONSTRAINT questionnaire_expiration_check
--         CHECK (
--             expires_at IS NULL
--             OR expires_at > created_at
--         )
-- );


-- CREATE TABLE IF NOT EXISTS community_questionnaires (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id) ON DELETE CASCADE,

--     questionnaire_link_id BIGINT NOT NULL UNIQUE
--         REFERENCES questionnaire_links(id) ON DELETE RESTRICT,

--     leader_name VARCHAR(100),

--     responses JSONB NOT NULL,

--     submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );


-- CREATE TABLE IF NOT EXISTS certificates (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

--     project_period_id BIGINT NOT NULL
--         REFERENCES project_periods(id) ON DELETE RESTRICT,

--     teacher_id BIGINT NOT NULL
--         REFERENCES teacher(id) ON DELETE RESTRICT,

--     project_file_id BIGINT NOT NULL UNIQUE
--         REFERENCES project_files(id) ON DELETE RESTRICT,

--     verification_code VARCHAR(100) NOT NULL UNIQUE,

--     issued_by_user_id BIGINT
--         REFERENCES users(id) ON DELETE SET NULL,

--     issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--     UNIQUE (project_period_id, teacher_id)
-- );


-- CREATE INDEX IF NOT EXISTS idx_projects_community
--     ON projects(community_id);

-- CREATE INDEX IF NOT EXISTS idx_projects_status
--     ON projects(status);

-- CREATE INDEX IF NOT EXISTS idx_project_periods_project
--     ON project_periods(project_id);

-- CREATE INDEX IF NOT EXISTS idx_project_periods_teacher
--     ON project_periods(teacher_id);

-- CREATE INDEX IF NOT EXISTS idx_project_periods_faculty
--     ON project_periods(faculty_id);

-- CREATE INDEX IF NOT EXISTS idx_project_periods_course
--     ON project_periods(course_id);

-- CREATE INDEX IF NOT EXISTS idx_project_periods_academic_period
--     ON project_periods(academic_period);

-- CREATE INDEX IF NOT EXISTS idx_project_ods_ods
--     ON project_ods(ods_id);

-- CREATE INDEX IF NOT EXISTS idx_project_reviews_period
--     ON project_reviews(project_period_id);

-- CREATE INDEX IF NOT EXISTS idx_project_files_period
--     ON project_files(project_period_id);

-- CREATE INDEX IF NOT EXISTS idx_project_status_history_project
--     ON project_status_history(project_id);

-- CREATE INDEX IF NOT EXISTS idx_questionnaire_links_period
--     ON questionnaire_links(project_period_id);

-- CREATE INDEX IF NOT EXISTS idx_community_questionnaires_period
--     ON community_questionnaires(project_period_id);

-- CREATE INDEX IF NOT EXISTS idx_certificates_teacher
--     ON certificates(teacher_id);

