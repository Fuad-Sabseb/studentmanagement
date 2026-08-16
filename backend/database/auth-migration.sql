
USE student_management;

ALTER TABLE students
    ADD COLUMN username VARCHAR(50) UNIQUE AFTER email,
    ADD COLUMN password_hash VARCHAR(255) AFTER username;

