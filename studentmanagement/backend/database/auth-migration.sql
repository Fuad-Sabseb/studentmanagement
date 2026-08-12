-- =====================================================================
-- Auth migration: add per-student login credentials
-- =====================================================================
-- Run this once against your existing database:
--   mysql -u root -p student_management < backend/database/auth-migration.sql
-- =====================================================================

USE student_management;

ALTER TABLE students
    ADD COLUMN username VARCHAR(50) UNIQUE AFTER email,
    ADD COLUMN password_hash VARCHAR(255) AFTER username;

-- Passwords are never stored in plain text or set directly in SQL.
-- After running this migration, generate real bcrypt-hashed credentials
-- for every active student by running:
--
--   cd backend
--   node scripts/seedStudentCredentials.js
--
-- That script prints a table of generated usernames + the shared
-- starter password so you can hand them out to each student.