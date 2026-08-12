USE student_management;

CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id      INT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'student_management'
      AND TABLE_NAME = 'users'
      AND CONSTRAINT_NAME = 'fk_users_student'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT "fk_users_student already exists, skipping"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'student_management' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_role'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_users_role ON users(role)', 'SELECT "idx_users_role already exists, skipping"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'student_management' AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_student_id'
);
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_users_student_id ON users(student_id)', 'SELECT "idx_users_student_id already exists, skipping"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'student_management' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'username'
);
SET @sql = IF(@col_exists > 0,
    'INSERT INTO users (username, password_hash, role, student_id)
     SELECT s.username, s.password_hash, ''student'', s.id
     FROM students s
     WHERE s.username IS NOT NULL AND s.password_hash IS NOT NULL
     ON DUPLICATE KEY UPDATE username = VALUES(username)',
    'SELECT "students.username column no longer exists, skipping migration"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'student_management' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'username'
);
SET @sql = IF(@col_exists > 0, 'ALTER TABLE students DROP COLUMN username', 'SELECT "username column already dropped"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'student_management' AND TABLE_NAME = 'students' AND COLUMN_NAME = 'password_hash'
);
SET @sql = IF(@col_exists > 0, 'ALTER TABLE students DROP COLUMN password_hash', 'SELECT "password_hash column already dropped"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
    UNIQUE KEY uq_student_course (student_id, course_id)
) ENGINE=InnoDB;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'student_management' AND TABLE_NAME = 'grades' AND CONSTRAINT_NAME = 'fk_grades_student'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE grades ADD CONSTRAINT fk_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT "fk_grades_student already exists, skipping"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'student_management' AND TABLE_NAME = 'grades' AND CONSTRAINT_NAME = 'fk_grades_course'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE grades ADD CONSTRAINT fk_grades_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT "fk_grades_course already exists, skipping"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration complete.' AS status;
