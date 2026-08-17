-- ---------------------------------------------------------------------
-- USERS TABLE (authentication + roles) — create BEFORE students FK isn't
-- needed since student_id FK is added after students table exists.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id      INT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);

-- ---------------------------------------------------------------------
-- GRADES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE grades (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    course_id       INT NOT NULL,
    mid_exam        DECIMAL(5,2) DEFAULT 0,
    quiz            DECIMAL(5,2) DEFAULT 0,
    assignment      DECIMAL(5,2) DEFAULT 0,
    final_exam      DECIMAL(5,2) DEFAULT 0,
    total_score     DECIMAL(5,2) DEFAULT 0,
    letter_grade    VARCHAR(2) DEFAULT NULL,
    gpa             DECIMAL(3,2) DEFAULT 0,
    cgpa            DECIMAL(3,2) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_student_course (student_id, course_id),

    CONSTRAINT fk_grades_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_grades_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;