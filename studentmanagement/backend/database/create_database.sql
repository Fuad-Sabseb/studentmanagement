-- =====================================================================
-- STUDENT MANAGEMENT SYSTEM - DATABASE AND TABLES CREATION
-- =====================================================================
-- This script creates the entire database structure from scratch.
-- Execute this once to set up the student management system database.
-- =====================================================================

-- 1. DROP DATABASE IF EXISTS (CAUTION: This will delete all existing data)
DROP DATABASE IF EXISTS student_management;

-- 2. CREATE DATABASE
CREATE DATABASE student_management;
USE student_management;

-- =====================================================================
-- TABLE 1: DEPARTMENTS
-- Purpose: Store department/faculty information
-- =====================================================================
CREATE TABLE departments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_departments_name ON departments(name);

-- =====================================================================
-- TABLE 2: STUDENTS
-- Purpose: Store student information with soft delete capability
-- =====================================================================
CREATE TABLE students (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    username        VARCHAR(50) UNIQUE,
    password_hash   VARCHAR(255),
    department_id   INT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_students_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_is_deleted ON students(is_deleted);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_username ON students(username);

-- =====================================================================
-- TABLE 3: COURSES
-- Purpose: Store course information linked to departments
-- =====================================================================
CREATE TABLE courses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    department_id   INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_courses_code ON courses(code);

-- =====================================================================
-- TABLE 4: STUDENT_COURSES (Junction Table)
-- Purpose: Manage many-to-many relationship between students and courses
-- =====================================================================
CREATE TABLE student_courses (
    student_id  INT NOT NULL,
    course_id   INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (student_id, course_id),
    
    CONSTRAINT fk_student_courses_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_courses_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_student_courses_course_id ON student_courses(course_id);

-- =====================================================================
-- TABLE 5: GRADES
-- Purpose: Store student grades with automatic calculations
-- Features: Stores individual marks, calculates totals, letter grades, GPA, and CGPA
-- =====================================================================
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
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_course_id ON grades(course_id);
CREATE INDEX idx_grades_letter_grade ON grades(letter_grade);

-- =====================================================================
-- TABLE 6: ANNOUNCEMENTS
-- Purpose: Store announcements with priority and audience targeting
-- =====================================================================
CREATE TABLE announcements (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    priority        ENUM('urgent', 'important', 'normal') DEFAULT 'normal',
    audience        VARCHAR(50) DEFAULT 'all',
    author_name     VARCHAR(100) DEFAULT 'Administration',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_audience ON announcements(audience);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- =====================================================================
-- TABLE 7: USERS
-- Purpose: Authentication and role management (admin, student)
-- =====================================================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id      INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_username ON users(username);

-- =====================================================================
-- END OF DATABASE CREATION
-- =====================================================================
-- Database: student_management
-- Tables Created: 7
--   1. departments (store departments/faculties)
--   2. students (store student information with soft delete)
--   3. courses (store courses with department associations)
--   4. student_courses (junction table for enrollment)
--   5. grades (store grades with auto-calculated GPA/CGPA)
--   6. announcements (store system announcements)
--   7. users (admin and student user accounts)
--
-- Foreign Key Relationships:
--   - students.department_id → departments.id
--   - courses.department_id → departments.id
--   - student_courses.student_id → students.id
--   - student_courses.course_id → courses.id
--   - grades.student_id → students.id
--   - grades.course_id → courses.id
--   - users.student_id → students.id
--
-- Key Features:
--   ✓ Soft delete on students (is_deleted flag)
--   ✓ Cascade delete on related records
--   ✓ Automatic timestamp management
--   ✓ Unique constraints on critical fields
--   ✓ UTF-8 support for international characters
--   ✓ Proper indexing for query performance
-- =====================================================================
