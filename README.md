# 🎓 Cohort University Student Management System (SIS)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)

> An enterprise-grade, full-stack 3-Tier Student Information System (SIS) engineered with MySQL Database ↔ Express REST API ↔ React (Vite) Frontend. Features 3-Tier Role-Based Access Control (RBAC), multi-component credit-weighted CGPA computation, in-browser spreadsheet batch grading with CSV import/export, interactive 5-day lecture timetables, and official downloadable PDF academic transcripts.

---

## 🌟 Key Features

### 🛡️ 1. Administrator Portal (`/admin`)
* Student Registration & Lifecycle Management: Add, update, and manage students with department affiliations and soft-delete (`is_deleted`) audit safety.
* Automated Credential Generation: Automatically provisions student portal user accounts (`Student@123`) upon registration with instant credential copy.
* Curriculum & Academic Terms: Configure departments, courses with credit hours (1–6), and academic semesters (e.g. *Year 1 Sem I, Year 2 Sem II*).
* Class Scheduling: Schedule lecture and lab timeslots mapping courses, rooms/halls, and instructors.
* Campus Notice Board: Broadcast announcements categorized by priority (`urgent`, important, `normal`) and audience.
* Analytics: Real-time KPI summary cards and visual course enrollment distribution charts.

### 👨‍🏫 2. Faculty / Teacher Portal (`/teacher`)
* Course Rosters: View assigned curriculum courses and enrolled student counts.
* Batch Spreadsheet Gradebook: Interactive inline spreadsheet table to enter Mid Exam (20%), Quiz (10%), Assignment (20%), and Final Exam (50%) marks with live GPA calculation.
* Excel / CSV Import & Export: One-click "Download Excel/CSV" roster templates and drag-and-drop "Upload Spreadsheet" file parser.
* Faculty Class Timetables: Direct view of weekly teaching schedules and assigned lecture halls.

### 🎓 3. Student Academic Portal (`/student`)
* Academic Dashboard: High-level ID Hero Card, enrolled courses list, and semester GPA breakdown.
* Credit-Weighted Cumulative GPA (CGPA): Accurate international university formula:
  $$\text{CGPA} = \frac{\sum (\text{Course GPA} \times \text{Credit Hours})}{\sum \text{Credit Hours}}$$
* Official PDF Academic Transcript: Instant, authenticated, printable PDF transcript featuring university letterhead, semester breakdown, total credits earned, honors standing (*Dean's List / Distinction*), and digital registrar signature seal.
* 5-Day Class Schedule Grid: Visual Monday–Friday weekly timetable with room locations and instructor names.
* Self-Service & Security: Update contact details (phone) and change password securely.

---

## 🏛️ System Architecture
+-------------------------------------------------------------------------+
|                         PRESENTATION LAYER (UI)                         |
|     React 18 + Vite • TailwindCSS • Framer Motion • Lucide Icons        |
|  - Admin Dashboard     - Faculty Portal         - Student Portal        |
|  - Batch Gradebook     - Weekly Timetable Grid  - PDF Transcript Viewer |
+------------------------------------+------------------------------------+
                                     | HTTP / REST (JWT Bearer Token)
                                     v
+-------------------------------------------------------------------------+
|                      APPLICATION / API LOGIC LAYER                      |
|                  Node.js + Express.js RESTful Engine                    |
|  - Router & Controllers     - RBAC & Auth Middleware (JWT + Bcrypt)     |
|  - Weighted GPA Calculator  - CSV Parser & Batch Processor              |
+------------------------------------+------------------------------------+
                                     | MySQL2 Connection Pool
                                     v
+-------------------------------------------------------------------------+
|                           DATA STORAGE LAYER                            |
|                          MySQL 8.0 / InnoDB DB                          |
|  - 3NF Normalized Schema   - Foreign Key Cascades & Triggers            |
|  - Soft-Delete Protection  - Parameterized Query Security               |
+-------------------------------------------------------------------------+


---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| Frontend UI | React 18, Vite 5, TailwindCSS, Framer Motion, Lucide React |
| Backend API | Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), bcryptjs, cors, dotenv |
| Database | MySQL 8.0 / MariaDB (InnoDB Engine, MySQL2 Connection Pool) |
| Testing | Vitest, React Testing Library, jsdom |

---

## 🗄️ Relational Database Schema (3NF)


erDiagram
    DEPARTMENTS ||--o{ STUDENTS : "organizes"
    DEPARTMENTS ||--o{ COURSES : "offers"
    SEMESTERS ||--o{ COURSES : "schedules"
    STUDENTS ||--o{ STUDENT_COURSES : "enrolls"
    COURSES ||--o{ STUDENT_COURSES : "has enrolled"
    STUDENTS ||--o{ GRADES : "receives"
    COURSES ||--o{ GRADES : "assessed in"
    STUDENTS ||--o| USERS : "authenticates"
    COURSES ||--o{ CLASS_SCHEDULES : "conducted at"

    DEPARTMENTS {
        int id PK
        varchar name UK
    }
    SEMESTERS {
        int id PK
        varchar name
        varchar academic_year
        boolean is_current
    }
    COURSES {
        int id PK
        varchar code UK
        varchar name
        int credit_hours
        int department_id FK
        int semester_id FK
    }
    STUDENTS {
        int id PK
        varchar name
        varchar email UK
        varchar phone
        int department_id FK
        boolean is_deleted
    }
    GRADES {
        int id PK
        int student_id FK
        int course_id FK
        decimal mid_exam
        decimal quiz
        decimal assignment
        decimal final_exam
        decimal total_score
        varchar letter_grade
        decimal gpa
        decimal cgpa
    }
    USERS {
        int id PK
        varchar username UK
        varchar password_hash
        enum role
        int student_id FK
    }
    CLASS_SCHEDULES {
        int id PK
        int course_id FK
        enum day_of_week
        varchar start_time
        varchar end_time
        varchar room
        varchar instructor_name
    }


---

## 🚀 Getting Started & Installation

### 1. Prerequisites
* Node.js: v18.0 or higher ([Download Node.js](https://nodejs.org/))
* MySQL Server: v8.0 or higher (or XAMPP / MariaDB)
* Git: Installed and configured

---

### 2. Clone the Repository

git clone https://github.com/Fuad-Sabseb/studentmanagement.git
cd studentmanagement


---

### 3. Backend Setup

1. Navigate to the backend directory:
   
   cd backend
   npm install
   2. Configure environment variables in backend/.env:
   
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=student_management_db
   JWT_SECRET=super_secret_jwt_key_12345
   

3. Start the backend development server:
   
   npm run dev
   
   *(The backend automatically creates all 8 relational tables and runs migrations on first startup!)*

---

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   
   cd frontend
   npm install
   

2. Start the Vite development server:
   
   npm run dev
   

3. Open your browser and navigate to:
   👉 `http://localhost:5173`

---

## 🔑 Default Seed Credentials

| Role | Username | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| Administrator | admin | admin123 | /admin |
| Teacher / Faculty | teacher1 | Teacher@123 | /teacher |
| Student | *(Auto-generated)* | Student@123 | /student |

---

## 📡 RESTful API Reference

| Method & Route | Access Level | Description |
| :--- | :--- | :--- |
| POST /api/auth/login | Public | Authenticates credentials; returns JWT token + user profile |
| POST /api/auth/change-password | Authenticated | Updates password hash with bcrypt verification |
| GET /api/students | Admin, Teacher | Lists active students with enrolled courses & departments |
| POST /api/students | Admin | Registers student & auto-generates login account |
| PUT /api/students/me | Student | Self-service contact update |
| GET /api/courses | Authenticated | Retrieves curriculum courses with credit hours & semesters |
| POST /api/courses | Admin | Creates course with credit hours & semester assignment |
| GET /api/grades/my-grades | Student | Retrieves logged-in student's grades and CGPA |
| POST /api/grades/batch | Admin, Teacher | Bulk spreadsheet grade entry for an entire course roster |
| GET /api/schedules/my-schedule | Student | Returns weekly timetable matching enrolled courses |
| GET /api/semesters | Authenticated | Lists all academic terms and active semester status |
| GET /api/announcements | Authenticated | Lists campus announcements sorted by priority |

---

## 🧪 Testing & Quality Assurance

Run the automated Vitest test suite in the frontend folder:

cd frontend
npm test


Results (100% Passing):

 ✓ src/tests/api.test.js (4 tests)
 ✓ src/tests/Footer.test.jsx (2 tests)
 ✓ src/tests/Header.test.jsx (2 tests)
 ✓ src/tests/StudentTable.test.jsx (1 test)
 ✓ src/tests/StudentModal.test.jsx (1 test)

 Test Files  5 passed (5)
      Tests  10 passed (10)


---

## 📂 Project Directory Structure
studentmanagement/
├── backend/
│   ├── src/
│   │   ├── config/          # MySQL connection pool & auto-migrations
│   │   ├── controllers/     # Business logic (student, grade, course, schedule)
│   │   ├── middleware/      # JWT auth, 3-Tier RBAC, validation, error handler
│   │   ├── models/          # Data access layer & parameterized SQL queries
│   │   ├── routes/          # RESTful route definitions
│   │   ├── app.js           # Express app setup & middleware chaining
│   │   └── server.js        # Server listener entry point
│   ├── .env                 # Backend environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Modals, Timetable, Transcripts)
│   │   ├── images/          # Assets and university branding logos
│   │   ├── services/        # Centralized Axios / Fetch API client
│   │   ├── tests/           # Vitest unit & integration test suites
│   │   ├── App.jsx          # Protected routing & 3-Tier RBAC switcher
│   │   ├── main.jsx         # React DOM root mounting
│   │   └── index.css        # Tailwind design tokens & glassmorphism theme
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── DOCUMENTATION_REPORT.md  # Comprehensive technical & academic report
│   ├── API_DOCUMENTATION.md     # Detailed API specification
│   └── generate_report_docx.js  # DOCX documentation report generator
│
└── README.md


---

## 👤 Author

* Fuad Sabseb
* GitHub: [@Fuad-Sabseb](https://github.com/Fuad-Sabseb)
* Project: Cohort University Student Management System (SIS)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.