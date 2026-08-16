
USE student_management;

CREATE TABLE IF NOT EXISTS departments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO departments (name)
SELECT DISTINCT department FROM students
WHERE department IS NOT NULL AND department <> ''
ON DUPLICATE KEY UPDATE departments.name = departments.name;

ALTER TABLE students
    ADD COLUMN phone VARCHAR(20) AFTER email,
    ADD COLUMN department_id INT AFTER phone,
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE AFTER department_id;

UPDATE students s
JOIN departments d ON d.name = s.department
SET s.department_id = d.id;

ALTER TABLE students
    ADD CONSTRAINT fk_students_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    DROP COLUMN department;

CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_is_deleted    ON students(is_deleted);

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
