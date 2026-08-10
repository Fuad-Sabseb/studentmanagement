-- =====================================================================
-- Student Management System - Database Schema
-- =====================================================================
-- This script upgrades the original single-table "students" database
-- into a normalized, relational schema with Departments, Courses and
-- a Student_Courses junction table (Many-to-Many).
--
-- Relationships:
--   Departments (1) ----< Students   (1 Department has many Students)
--   Departments (1) ----< Courses    (1 Department has many Courses)
--   Students    (M) >---< Courses    (Many-to-Many via student_courses)
-- =====================================================================

DROP DATABASE IF EXISTS student_management;
CREATE DATABASE student_management;
USE student_management;

-- ---------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ---------------------------------------------------------------------
-- PK: id
CREATE TABLE departments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. STUDENTS TABLE (upgraded from the original table)
-- ---------------------------------------------------------------------
-- PK: id
-- FK: department_id -> departments.id
CREATE TABLE students (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    department_id   INT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_students_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_is_deleted    ON students(is_deleted);

-- ---------------------------------------------------------------------
-- 3. COURSES TABLE
-- ---------------------------------------------------------------------
-- PK: id
-- FK: department_id -> departments.id
CREATE TABLE courses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    department_id   INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_courses_department_id ON courses(department_id);

-- ---------------------------------------------------------------------
-- 4. STUDENT_COURSES TABLE (Many-to-Many junction table)
-- ---------------------------------------------------------------------
-- Composite PK: (student_id, course_id)
-- FK: student_id -> students.id
-- FK: course_id  -> courses.id
CREATE TABLE student_courses (
    student_id  INT NOT NULL,
    course_id   INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (student_id, course_id),

    CONSTRAINT fk_sc_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_sc_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- SEED DATA (sample data for development / testing / demo)
-- =====================================================================

INSERT INTO departments (name) VALUES
    ('Computer Science'),
    ('Software Engineering'),
    ('Electrical Engineering'),
    ('Business Administration');

INSERT INTO courses (name, code, department_id) VALUES
    ('Data Structures and Algorithms', 'CS201', 1),
    ('Database Systems',               'CS305', 1),
    ('Operating Systems',              'SE210', 2),
    ('Software Engineering Principles','SE310', 2),
    ('Digital Logic Design',           'EE150', 3),
    ('Principles of Management',       'BA101', 4);

INSERT INTO students (name, email, phone, department_id) VALUES
    ('Fuad Sabseb',    'fuad.sabseb@example.com',    '0911000001', 2),
    ('Abebe Kebede',   'abebe.kebede@example.com',   '0911000002', 1),
    ('Selam Tesfaye',  'selam.tesfaye@example.com',  '0911000003', 1),
    ('Hana Girma',     'hana.girma@example.com',     '0911000004', 3),
    ('Kaleb Worku',    'kaleb.worku@example.com',    '0911000005', 4),
    ('Marta Alemu',    'marta.alemu@example.com',    '0911000006', 2);

INSERT INTO student_courses (student_id, course_id) VALUES
    (1, 3), (1, 4),
    (2, 1), (2, 2),
    (3, 1),
    (4, 5),
    (5, 6),
    (6, 3);
