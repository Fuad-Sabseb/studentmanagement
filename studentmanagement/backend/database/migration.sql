-- =====================================================================
-- Migration Script: original students table -> improved schema
-- =====================================================================
-- Use this script if you already have the ORIGINAL single-table
-- database (department as VARCHAR) and want to migrate it in place
-- instead of recreating the database from schema.sql.
--
-- Original table:
--   CREATE TABLE students (
--       id INT AUTO_INCREMENT PRIMARY KEY,
--       name VARCHAR(100) NOT NULL,
--       email VARCHAR(100) UNIQUE NOT NULL,
--       department VARCHAR(100),
--       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--   );
-- =====================================================================

USE student_management;

-- 1. Create the new departments table
CREATE TABLE IF NOT EXISTS departments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Populate departments from the distinct text values already in students
INSERT INTO departments (name)
SELECT DISTINCT department FROM students
WHERE department IS NOT NULL AND department <> ''
ON DUPLICATE KEY UPDATE departments.name = departments.name;

-- 3. Add new columns to students
ALTER TABLE students
    ADD COLUMN phone VARCHAR(20) AFTER email,
    ADD COLUMN department_id INT AFTER phone,
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE AFTER department_id;

-- 4. Backfill department_id from the old text department column
UPDATE students s
JOIN departments d ON d.name = s.department
SET s.department_id = d.id;

-- 5. Add the foreign key + index, then drop the old text column
ALTER TABLE students
    ADD CONSTRAINT fk_students_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    DROP COLUMN department;

CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_is_deleted    ON students(is_deleted);

-- 6. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    department_id   INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_courses_department_id ON courses(department_id);

-- 7. Create student_courses junction table
CREATE TABLE IF NOT EXISTS student_courses (
    student_id  INT NOT NULL,
    course_id   INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id),
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sc_course  FOREIGN KEY (course_id)  REFERENCES courses(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
