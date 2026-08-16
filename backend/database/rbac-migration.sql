USE student_management;

-- ---------------------------------------------------------------------
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id      INT NULL,               -- only populated when role = 'student'
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);


INSERT INTO users (username, password_hash, role, student_id)
SELECT s.username, s.password_hash, 'student', s.id
FROM students s
WHERE s.username IS NOT NULL
  AND s.password_hash IS NOT NULL
ON DUPLICATE KEY UPDATE username = username;

-- Old per-student credential columns are now redundant — auth lives in `users`.
ALTER TABLE students
    DROP COLUMN IF EXISTS username,
    DROP COLUMN IF EXISTS password_hash;

-- ---------------------------------------------------------------------
-- 3. GRADES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    course_id       INT NOT NULL,
    mid_exam        DECIMAL(5,2) DEFAULT 0,
    quiz            DECIMAL(5,2) DEFAULT 0,
    assignment      DECIMAL(5,2) DEFAULT 0,
    final_exam      DECIMAL(5,2) DEFAULT 0,
    total_score     DECIMAL(5,2) DEFAULT 0,
    letter_grade    VARCHAR(2)  DEFAULT NULL,
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

-- ---------------------------------------------------------------------
-- 4. Seed a default admin (password set by scripts/seedAdmin.js — do NOT
--    hardcode a plaintext/bcrypt hash here). Run after this migration:
--      node backend/scripts/seedAdmin.js
-- ---------------------------------------------------------------------