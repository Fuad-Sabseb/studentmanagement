# Database Queries Documentation

This document lists all database queries used in the backend code, mapped directly to their source models and featuring their exact functionality.

---

## Database Tables Overview

### `students` Table
- **id**: INT (Primary Key, Auto-increment)
- **name**: VARCHAR(100)
- **email**: VARCHAR(100) (Unique)
- **phone**: VARCHAR(20)
- **department_id**: INT (Foreign Key → departments.id)
- **is_deleted**: BOOLEAN (Soft delete flag)
- **created_at**: TIMESTAMP
- **username**: VARCHAR(50) (Unique)
- **password_hash**: VARCHAR(255)

### `departments` Table
- **id**: INT (Primary Key, Auto-increment)
- **name**: VARCHAR(100) (Unique)
- **created_at**: TIMESTAMP

### `courses` Table
- **id**: INT (Primary Key, Auto-increment)
- **name**: VARCHAR(150)
- **code**: VARCHAR(20) (Unique)
- **department_id**: INT (Foreign Key → departments.id)
- **created_at**: TIMESTAMP

### `student_courses` Table (Junction)
- **student_id**: INT (Foreign Key → students.id)
- **course_id**: INT (Foreign Key → courses.id)
- **enrolled_at**: TIMESTAMP
- **Primary Key**: (student_id, course_id)

### `grades` Table
- **id**: INT (Primary Key, Auto-increment)
- **student_id**: INT (Foreign Key → students.id)
- **course_id**: INT (Foreign Key → courses.id)
- **mid_exam**: DECIMAL(5,2)
- **quiz**: DECIMAL(5,2)
- **assignment**: DECIMAL(5,2)
- **final_exam**: DECIMAL(5,2)
- **total_score**: DECIMAL(5,2)
- **letter_grade**: VARCHAR(2)
- **gpa**: DECIMAL(3,2)
- **cgpa**: DECIMAL(3,2)
- **created_at**: TIMESTAMP
- **updated_at**: TIMESTAMP
- **Unique Key**: (student_id, course_id)

### `announcements` Table
- **id**: INT (Primary Key, Auto-increment)
- **title**: VARCHAR (or TEXT)
- **content**: TEXT
- **priority**: ENUM('urgent', 'important', 'normal')
- **audience**: ENUM or VARCHAR (e.g., 'all', 'students', 'admins')
- **author_name**: VARCHAR
- **created_at**: TIMESTAMP
- **updated_at**: TIMESTAMP

### `users` Table
- **id**: INT (Primary Key, Auto-increment)
- **username**: VARCHAR(50) (Unique)
- **password_hash**: VARCHAR(255)
- **role**: ENUM('admin', 'student')
- **student_id**: INT (Foreign Key → students.id, Nullable)
- **is_active**: BOOLEAN
- **created_at**: TIMESTAMP

---

## Queries by Module

---

# STUDENT MODEL (studentModel.js)

## 1. CREATE STUDENT
**File**: `src/models/studentModel.js` → `createStudent()`
**Feature**: Insert new student record
```javascript
INSERT INTO students (name, email, phone, department_id)
VALUES (?, ?, ?, ?)
```
**Parameters**: name, email, phone, department_id
**Returns**: Insert result object with insertId

---

## 2. GET ALL ACTIVE STUDENTS
**File**: `src/models/studentModel.js` → `getAllStudents()`
**Feature**: Retrieve all students (excluding soft-deleted), with department name and enrolled courses as JSON array
```javascript
SELECT
    s.id,
    s.name,
    s.email,
    s.phone,
    s.department_id,
    d.name AS department_name,
    s.is_deleted,
    s.created_at,
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', c.id,
                    'name', c.name,
                    'code', c.code,
                    'mid_exam', g.mid_exam,
                    'quiz', g.quiz,
                    'assignment', g.assignment,
                    'final_exam', g.final_exam,
                    'total_score', g.total_score,
                    'letter_grade', g.letter_grade,
                    'gpa', g.gpa,
                    'status', CASE
                        WHEN g.id IS NULL THEN 'not_inserted'
                        WHEN (g.final_exam > 0) OR (g.total_score > 0 AND g.letter_grade IS NOT NULL AND g.final_exam > 0) THEN 'inserted'
                        WHEN g.mid_exam > 0 OR g.quiz > 0 OR g.assignment > 0 THEN 'partial'
                        ELSE 'not_inserted'
                    END
                )
            )
            FROM student_courses sc
            JOIN courses c ON c.id = sc.course_id
            LEFT JOIN grades g ON g.student_id = sc.student_id AND g.course_id = sc.course_id
            WHERE sc.student_id = s.id
        ),
        JSON_ARRAY()
    ) AS courses
FROM students s
LEFT JOIN departments d ON d.id = s.department_id
WHERE s.is_deleted = FALSE
ORDER BY s.id DESC
```
**Parameters**: None
**Returns**: Array of student objects with nested courses

---

## 3. GET STUDENT BY ID
**File**: `src/models/studentModel.js` → `getStudentById(id)`
**Feature**: Fetch single student with department name and courses (only if active)
```javascript
[BASE_SELECT]
WHERE s.id = ? AND s.is_deleted = FALSE
```
**Parameters**: id (student ID)
**Returns**: Single student object or undefined

---

## 4. GET STUDENTS BY DEPARTMENT
**File**: `src/models/studentModel.js` → `getStudentsByDepartment(dept)`
**Feature**: Fetch all students in a department (numeric ID or text name), with courses
```javascript
-- If dept is numeric:
[BASE_SELECT]
WHERE s.is_deleted = FALSE AND s.department_id = ?
ORDER BY s.id DESC

-- If dept is text:
[BASE_SELECT]
WHERE s.is_deleted = FALSE AND d.name = ?
ORDER BY s.id DESC
```
**Parameters**: dept (INT or VARCHAR - department_id or name)
**Returns**: Array of student objects

---

## 5. UPDATE STUDENT
**File**: `src/models/studentModel.js` → `updateStudent(id, student)`
**Feature**: Update student details (only if not soft-deleted)
```javascript
UPDATE students
SET name = ?,
    email = ?,
    phone = ?,
    department_id = ?
WHERE id = ? AND is_deleted = FALSE
```
**Parameters**: id, name, email, phone, department_id
**Returns**: Update result object

---

## 6. SOFT DELETE STUDENT
**File**: `src/models/studentModel.js` → `deleteStudent(id)`
**Feature**: Flag student as deleted (not physically removed)
```javascript
UPDATE students SET is_deleted = TRUE WHERE id = ?
```
**Parameters**: id
**Returns**: Delete result object

---

## 7. COUNT ACTIVE STUDENTS
**File**: `src/models/studentModel.js` → `countActiveStudents()`
**Feature**: Get total count of non-deleted students
```javascript
SELECT COUNT(*) AS total FROM students WHERE is_deleted = FALSE
```
**Parameters**: None
**Returns**: Total count (INT)

---

## 8. CHECK STUDENT EXISTS
**File**: `src/models/studentModel.js` → `studentExists(id)`
**Feature**: Verify if student exists and is active
```javascript
SELECT id FROM students WHERE id = ? AND is_deleted = FALSE
```
**Parameters**: id
**Returns**: Boolean (rows.length > 0)

---

## 9. ASSIGN COURSE TO STUDENT
**File**: `src/models/studentModel.js` → `assignCourse(studentId, courseId)`
**Feature**: Enroll student in a course (uses INSERT IGNORE to avoid duplicates)
```javascript
INSERT IGNORE INTO student_courses (student_id, course_id) VALUES (?, ?)
```
**Parameters**: studentId, courseId
**Returns**: Insert result object

---

## 10. REMOVE COURSE FROM STUDENT
**File**: `src/models/studentModel.js` → `removeCourse(studentId, courseId)`
**Feature**: Unenroll student from a course
```javascript
DELETE FROM student_courses WHERE student_id = ? AND course_id = ?
```
**Parameters**: studentId, courseId
**Returns**: Delete result object

---

# COURSE MODEL (courseModel.js)

## 11. CREATE COURSE
**File**: `src/models/courseModel.js` → `createCourse(course)`
**Feature**: Insert new course
```javascript
INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)
```
**Parameters**: name, code, department_id (nullable)
**Returns**: Insert result object with insertId

---

## 12. GET ALL COURSES
**File**: `src/models/courseModel.js` → `getAllCourses()`
**Feature**: Retrieve all courses with department name and enrollment count
```javascript
SELECT
    c.id,
    c.name,
    c.code,
    c.department_id,
    d.name AS department_name,
    c.created_at,
    (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) AS enrolled_count
FROM courses c
LEFT JOIN departments d ON d.id = c.department_id
ORDER BY c.name ASC
```
**Parameters**: None
**Returns**: Array of course objects with enrollment stats

---

## 13. GET COURSE BY ID
**File**: `src/models/courseModel.js` → `getCourseById(id)`
**Feature**: Fetch single course record
```javascript
SELECT * FROM courses WHERE id = ?
```
**Parameters**: id
**Returns**: Single course object or undefined

---

## 14. UPDATE COURSE
**File**: `src/models/courseModel.js` → `updateCourse(id, course)`
**Feature**: Update course details
```javascript
UPDATE courses SET name = ?, code = ?, department_id = ? WHERE id = ?
```
**Parameters**: id, name, code, department_id
**Returns**: Update result object

---

## 15. DELETE COURSE
**File**: `src/models/courseModel.js` → `deleteCourse(id)`
**Feature**: Physically delete course (cascades to grades and enrollments)
```javascript
DELETE FROM courses WHERE id = ?
```
**Parameters**: id
**Returns**: Delete result object

---

# GRADE MODEL (gradeModel.js)

## 16. UPSERT GRADE
**File**: `src/models/gradeModel.js` → `upsertGrade(studentId, courseId, marks)`
**Feature**: Insert or update grade; merges partial marks, auto-calculates total_score, letter_grade, gpa, and recalculates cgpa across all student's grades
```javascript
INSERT INTO grades (student_id, course_id, mid_exam, quiz, assignment, final_exam, total_score, letter_grade, gpa)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    mid_exam = VALUES(mid_exam),
    quiz = VALUES(quiz),
    assignment = VALUES(assignment),
    final_exam = VALUES(final_exam),
    total_score = VALUES(total_score),
    letter_grade = VALUES(letter_grade),
    gpa = VALUES(gpa)
```
**Parameters**: studentId, courseId, marks (object with mid_exam, quiz, assignment, final_exam - partial values allowed)
**Features**:
- Merges with existing marks (e.g., new final_exam preserves previous mid_exam)
- Auto-calculates: total_score = mid(20%) + quiz(10%) + assignment(20%) + final(50%)
- Maps score to letter_grade: A+ (90+), A (85-89), A- (80-84), B+ (75-79), B (70-74), B- (65-69), C+ (60-64), C (50-59), C- (45-49), D (40-44), F (<40)
- Calculates gpa (4.0 scale): A+/A (4.0), A- (3.75), B+ (3.5), B (3.0), B- (2.75), C+ (2.5), C (2.0), C- (1.75), D (1.0), F (0.0)
- Recalculates student's cgpa across all grades
**Returns**: Updated/inserted grade object

---

## 17. UPDATE GRADE BY ID
**File**: `src/models/gradeModel.js` → `updateGradeById(id, marks)`
**Feature**: Update specific grade by ID; preserves unmapped marks, recalculates derived fields and cgpa
```javascript
UPDATE grades
SET mid_exam = ?, quiz = ?, assignment = ?, final_exam = ?,
    total_score = ?, letter_grade = ?, gpa = ?
WHERE id = ?
```
**Parameters**: id (grade ID), marks (partial object)
**Returns**: Updated grade object

---

## 18. GET GRADES BY STUDENT
**File**: `src/models/gradeModel.js` → `getGradesByStudent(studentId)`
**Feature**: Retrieve all grades for a student with course name and code
```javascript
SELECT g.*, c.name AS course_name, c.code AS course_code
FROM grades g
JOIN courses c ON c.id = g.course_id
WHERE g.student_id = ?
ORDER BY c.name ASC
```
**Parameters**: studentId
**Returns**: Array of grade objects with course info

---

## 19. GET GRADE BY STUDENT AND COURSE
**File**: `src/models/gradeModel.js` → `getGradeByStudentAndCourse(studentId, courseId)`
**Feature**: Fetch single grade record
```javascript
SELECT g.*, c.name AS course_name, c.code AS course_code
FROM grades g
JOIN courses c ON c.id = g.course_id
WHERE g.student_id = ? AND g.course_id = ?
```
**Parameters**: studentId, courseId
**Returns**: Single grade object or null

---

## 20. GET ENROLLED STUDENTS FOR COURSE
**File**: `src/models/gradeModel.js` → `getEnrolledStudentsForCourse(courseId)`
**Feature**: Retrieve all students enrolled in a course with grade status
```javascript
SELECT
    s.id AS student_id,
    s.name AS student_name,
    s.email AS student_email,
    d.name AS department_name,
    c.id AS course_id,
    c.name AS course_name,
    c.code AS course_code,
    g.id AS grade_id,
    g.mid_exam,
    g.quiz,
    g.assignment,
    g.final_exam,
    g.total_score,
    g.letter_grade,
    g.gpa,
    CASE
        WHEN g.id IS NULL THEN 'not_inserted'
        WHEN (g.final_exam > 0) OR (g.total_score > 0 AND g.letter_grade IS NOT NULL AND g.final_exam > 0) THEN 'inserted'
        WHEN g.mid_exam > 0 OR g.quiz > 0 OR g.assignment > 0 THEN 'partial'
        ELSE 'not_inserted'
    END AS status
FROM student_courses sc
JOIN students s ON s.id = sc.student_id AND s.is_deleted = FALSE
JOIN courses c ON c.id = sc.course_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN grades g ON g.student_id = s.id AND g.course_id = c.id
WHERE sc.course_id = ?
ORDER BY s.name ASC
```
**Parameters**: courseId
**Returns**: Array of student-grade objects with status indicator

---

## 21. BATCH UPSERT GRADES
**File**: `src/models/gradeModel.js` → `batchUpsertGrades(courseId, gradeEntries)`
**Feature**: Bulk insert/update multiple grades for a course
```javascript
-- Calls upsertGrade() for each entry
```
**Parameters**: courseId, gradeEntries (array of {student_id, mid_exam?, quiz?, assignment?, final_exam?})
**Returns**: Array of upserted grade objects

---

## 22. GET GRADE BY ID
**File**: `src/models/gradeModel.js` → `getGradeById(id)`
**Feature**: Fetch single grade by ID
```javascript
SELECT * FROM grades WHERE id = ?
```
**Parameters**: id
**Returns**: Single grade object or undefined

---

## 23. DELETE GRADE
**File**: `src/models/gradeModel.js` → `deleteGrade(id)`
**Feature**: Delete grade and recalculate student's cgpa
```javascript
DELETE FROM grades WHERE id = ?
```
**Parameters**: id
**Returns**: Delete result object

---

# DEPARTMENT MODEL (departmentModel.js)

## 24. CREATE DEPARTMENT
**File**: `src/models/departmentModel.js` → `createDepartment(department)`
**Feature**: Insert new department
```javascript
INSERT INTO departments (name) VALUES (?)
```
**Parameters**: name
**Returns**: Insert result object with insertId

---

## 25. GET ALL DEPARTMENTS
**File**: `src/models/departmentModel.js` → `getAllDepartments()`
**Feature**: Retrieve all departments with student and course counts
```javascript
SELECT
    d.id,
    d.name,
    d.created_at,
    (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id AND s.is_deleted = FALSE) AS student_count,
    (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS course_count
FROM departments d
ORDER BY d.name ASC
```
**Parameters**: None
**Returns**: Array of department objects with stats

---

## 26. GET DEPARTMENT BY ID
**File**: `src/models/departmentModel.js` → `getDepartmentById(id)`
**Feature**: Fetch single department record
```javascript
SELECT * FROM departments WHERE id = ?
```
**Parameters**: id
**Returns**: Single department object or undefined

---

## 27. UPDATE DEPARTMENT
**File**: `src/models/departmentModel.js` → `updateDepartment(id, department)`
**Feature**: Update department name
```javascript
UPDATE departments SET name = ? WHERE id = ?
```
**Parameters**: id, name
**Returns**: Update result object

---

## 28. DELETE DEPARTMENT
**File**: `src/models/departmentModel.js` → `deleteDepartment(id)`
**Feature**: Physically delete department (cascades to courses and enrollments)
```javascript
DELETE FROM departments WHERE id = ?
```
**Parameters**: id
**Returns**: Delete result object

---

# ANNOUNCEMENT MODEL (announcementModel.js)

## 29. CREATE ANNOUNCEMENT
**File**: `src/models/announcementModel.js` → `createAnnouncement()`
**Feature**: Insert new announcement with priority and audience targeting
```javascript
INSERT INTO announcements (title, content, priority, audience, author_name)
VALUES (?, ?, ?, ?, ?)
```
**Parameters**: title, content, priority ('urgent'|'important'|'normal'), audience ('all'|'students'|'admins'), author_name
**Returns**: Insert result object with insertId

---

## 30. GET ALL ANNOUNCEMENTS
**File**: `src/models/announcementModel.js` → `getAllAnnouncements(audience)`
**Feature**: Retrieve announcements filtered by audience, ordered by priority and date
```javascript
SELECT id, title, content, priority, audience, author_name, created_at, updated_at
FROM announcements
WHERE audience = 'all' OR audience = ?
ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'important' THEN 2 ELSE 3 END, created_at DESC
```
**Parameters**: audience (optional - 'all'|'students'|'admins', defaults to null showing all)
**Returns**: Array of announcement objects sorted by priority

---

## 31. GET ANNOUNCEMENT BY ID
**File**: `src/models/announcementModel.js` → `getAnnouncementById(id)`
**Feature**: Fetch single announcement
```javascript
SELECT * FROM announcements WHERE id = ?
```
**Parameters**: id
**Returns**: Single announcement object or undefined

---

## 32. UPDATE ANNOUNCEMENT
**File**: `src/models/announcementModel.js` → `updateAnnouncement(id, {...})`
**Feature**: Update announcement fields (coalesces with existing values)
```javascript
UPDATE announcements
SET title = COALESCE(?, title),
    content = COALESCE(?, content),
    priority = COALESCE(?, priority),
    audience = COALESCE(?, audience)
WHERE id = ?
```
**Parameters**: id, title?, content?, priority?, audience?
**Returns**: Update result object

---

## 33. DELETE ANNOUNCEMENT
**File**: `src/models/announcementModel.js` → `deleteAnnouncement(id)`
**Feature**: Physically delete announcement
```javascript
DELETE FROM announcements WHERE id = ?
```
**Parameters**: id
**Returns**: Delete result object

---

# AUTH MODEL (authModel.js) - Student Authentication

## 34. FIND STUDENT BY USERNAME
**File**: `src/models/authModel.js` → `findByUsername(username)`
**Feature**: Look up student for login (includes password_hash, only used in auth flow)
```javascript
SELECT id, name, email, username, password_hash, department_id
FROM students
WHERE username = ? AND is_deleted = FALSE
```
**Parameters**: username
**Returns**: Student object or undefined
**Security**: password_hash is NEVER exposed by other endpoints, only returned here for authentication

---

## 35. FIND STUDENT BY ID
**File**: `src/models/authModel.js` → `findById(id)`
**Feature**: Retrieve student by ID (no password_hash, used after auth)
```javascript
SELECT id, name, email, username, department_id
FROM students
WHERE id = ? AND is_deleted = FALSE
```
**Parameters**: id
**Returns**: Student object or undefined

---

# USER MODEL (userModel.js) - Admin/Role-Based Authentication

## 36. FIND USER BY USERNAME
**File**: `src/models/userModel.js` → `findByUsername(username)`
**Feature**: Look up user (admin/student) from users table with role (includes password_hash for login)
```javascript
SELECT id, username, password_hash, role, student_id, is_active
FROM users
WHERE username = ?
```
**Parameters**: username
**Returns**: User object or undefined
**Security**: password_hash NEVER exposed elsewhere, only in login flow

---

## 37. FIND USER BY ID
**File**: `src/models/userModel.js` → `findById(id)`
**Feature**: Retrieve user with role and linked student info (no password)
```javascript
SELECT u.id, u.username, u.role, u.student_id,
       s.name, s.email, s.department_id
FROM users u
LEFT JOIN students s ON s.id = u.student_id
WHERE u.id = ?
```
**Parameters**: id
**Returns**: User object with student details or undefined

---

## Summary

**Total Queries**: 37

**By Category**:
- **Students**: 10 queries
- **Courses**: 5 queries
- **Grades**: 8 queries (with auto-calculation features)
- **Departments**: 4 queries
- **Announcements**: 5 queries
- **Auth (Students)**: 2 queries
- **Auth (Users/Admins)**: 2 queries
- **Derived/Helper**: Soft-delete pattern, JSON aggregation, priority sorting

**Key Features**:
- ✅ Soft deletes on students (is_deleted flag)
- ✅ JSON aggregation for nested course data
- ✅ Auto-calculated grades (GPA, CGPA, letter grades)
- ✅ Enrollment count aggregation
- ✅ Priority-based announcement ordering
- ✅ Audience-filtered announcements
- ✅ Partial mark preservation in grade updates
- ✅ RBAC user/student distinction
- ✅ Cascade deletes and updates via foreign keys
