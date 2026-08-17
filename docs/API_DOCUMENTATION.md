# 📡 API DOCUMENTATION — COHORT STUDENT MANAGEMENT SYSTEM

## Base URL
`http://localhost:5001/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates admin, faculty, or student and returns a signed JWT token.
- **Request Body**:
  ```json
  {
    "username": "student1",
    "password": "Student@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "student1",
      "role": "student",
      "studentId": 1
    }
  }
  ```

### `POST /api/auth/change-password`
- **Access**: Authenticated (`admin`, `teacher`, `student`)
- **Request Body**:
  ```json
  {
    "currentPassword": "Student@123",
    "newPassword": "NewSecurePassword456"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

## 2. Students Endpoints (`/api/students`)

### `GET /api/students`
- **Access**: Admin
- **Response**: Array of students with enrolled courses and department info.

### `POST /api/students`
- **Access**: Admin
- **Description**: Registers a student and auto-generates a user login account.
- **Request Body**:
  ```json
  {
    "name": "Fuad Sabseb",
    "email": "fuad.sabseb@example.com",
    "phone": "0911223344",
    "department_id": 1
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "id": 1,
    "credentials": {
      "username": "fuad.sabseb",
      "defaultPassword": "Student@123"
    }
  }
  ```

### `PUT /api/students/me`
- **Access**: Student
- **Description**: Self-service contact update.

---

## 3. Grades & Assessment Endpoints (`/api/grades`)

### `GET /api/grades/my-grades`
- **Access**: Student
- **Description**: Retrieves logged-in student's grades, score breakdown, and calculated CGPA.

### `POST /api/grades/batch`
- **Access**: Admin, Teacher
- **Description**: Spreadsheet-style bulk upsert for all students in a course.
- **Request Body**:
  ```json
  {
    "course_id": 1,
    "grades": [
      {
        "student_id": 1,
        "mid_exam": 18,
        "quiz": 9,
        "assignment": 19,
        "final_exam": 46
      }
    ]
  }
  ```

---

## 4. Academic Semesters Endpoints (`/api/semesters`)

### `GET /api/semesters`
- **Access**: Authenticated

### `POST /api/semesters`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "name": "Year 1 Sem I",
    "academic_year": "2025/2026",
    "is_current": true
  }
  ```

---

## 5. Class Schedules & Timetables (`/api/schedules`)

### `GET /api/schedules/my-schedule`
- **Access**: Student
- **Description**: Returns weekly class timetable matching enrolled courses.

### `POST /api/schedules`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "course_id": 1,
    "day_of_week": "Monday",
    "start_time": "08:30",
    "end_time": "10:00",
    "room": "Hall 3B",
    "instructor_name": "Dr. Smith"
  }
  ```

---

## 6. Notice Board Endpoints (`/api/announcements`)

### `GET /api/announcements`
- **Access**: Authenticated
- **Description**: Lists announcements sorted by priority (`urgent` > `important` > `normal`).
