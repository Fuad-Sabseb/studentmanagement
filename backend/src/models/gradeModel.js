/**
 * =====================================================
 * gradeModel.js
 * -----------------------------------------------------
 * CRUD for the grades table, plus derived total_score /
 * letter_grade / gpa / cgpa calculation.
 *
 * Weighting (adjust to your institution's policy):
 *   total_score = mid(20%) + quiz(10%) + assignment(20%) + final(50%)
 * Letter grade thresholds and 4.0-scale GPA mapping follow below.
 * cgpa is the average GPA across all of the student's graded courses,
 * recomputed and denormalized onto every one of their grade rows.
 * =====================================================
 */
const { pool } = require("../config/db");

function computeDerived({ mid_exam = 0, quiz = 0, assignment = 0, final_exam = 0 }) {
    const mid = Number(mid_exam) || 0;
    const q = Number(quiz) || 0;
    const assign = Number(assignment) || 0;
    const fin = Number(final_exam) || 0;

    // Flexible scoring: if sum of components <= 100, use direct sum, else use standard weighted sum
    let total_score = (mid + q + assign + fin <= 100)
        ? (mid + q + assign + fin)
        : (mid * 0.2 + q * 0.1 + assign * 0.2 + fin * 0.5);

    total_score = Number(Math.min(100, Math.max(0, total_score)).toFixed(2));

    let letter_grade, gpa;
    if (total_score >= 90) { letter_grade = "A+"; gpa = 4.0; }
    else if (total_score >= 85) { letter_grade = "A"; gpa = 4.0; }
    else if (total_score >= 80) { letter_grade = "A-"; gpa = 3.75; }
    else if (total_score >= 75) { letter_grade = "B+"; gpa = 3.5; }
    else if (total_score >= 70) { letter_grade = "B"; gpa = 3.0; }
    else if (total_score >= 65) { letter_grade = "B-"; gpa = 2.75; }
    else if (total_score >= 60) { letter_grade = "C+"; gpa = 2.5; }
    else if (total_score >= 50) { letter_grade = "C"; gpa = 2.0; }
    else if (total_score >= 45) { letter_grade = "C-"; gpa = 1.75; }
    else if (total_score >= 40) { letter_grade = "D"; gpa = 1.0; }
    else { letter_grade = "F"; gpa = 0.0; }

    return { total_score, letter_grade, gpa };
}

async function recalculateCgpa(studentId) {
    const [rows] = await pool.query(`
        SELECT g.gpa, COALESCE(c.credit_hours, 3) AS credit_hours
        FROM grades g
        JOIN courses c ON c.id = g.course_id
        WHERE g.student_id = ?
    `, [studentId]);

    if (rows.length === 0) return 0;
    const totalCredits = rows.reduce((sum, r) => sum + Number(r.credit_hours), 0);
    if (totalCredits === 0) return 0;

    const weightedPoints = rows.reduce((sum, r) => sum + (Number(r.gpa) * Number(r.credit_hours)), 0);
    const cgpa = Number((weightedPoints / totalCredits).toFixed(2));

    await pool.execute("UPDATE grades SET cgpa = ? WHERE student_id = ?", [cgpa, studentId]);
    return cgpa;
}

const upsertGrade = async (studentId, courseId, marks) => {
    // Fetch existing grade if any to retain previously saved marks (e.g. mid_exam persists when entering final_exam)
    const [existingRows] = await pool.query(
        "SELECT * FROM grades WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
    );
    const existing = existingRows[0] || {};

    const mergedMarks = {
        mid_exam: marks.mid_exam !== undefined && marks.mid_exam !== "" && marks.mid_exam !== null
            ? Number(marks.mid_exam)
            : (existing.mid_exam !== undefined ? Number(existing.mid_exam) : 0),
        quiz: marks.quiz !== undefined && marks.quiz !== "" && marks.quiz !== null
            ? Number(marks.quiz)
            : (existing.quiz !== undefined ? Number(existing.quiz) : 0),
        assignment: marks.assignment !== undefined && marks.assignment !== "" && marks.assignment !== null
            ? Number(marks.assignment)
            : (existing.assignment !== undefined ? Number(existing.assignment) : 0),
        final_exam: marks.final_exam !== undefined && marks.final_exam !== "" && marks.final_exam !== null
            ? Number(marks.final_exam)
            : (existing.final_exam !== undefined ? Number(existing.final_exam) : 0)
    };

    const { total_score, letter_grade, gpa } = computeDerived(mergedMarks);

    await pool.execute(
        `INSERT INTO grades (student_id, course_id, mid_exam, quiz, assignment, final_exam, total_score, letter_grade, gpa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            mid_exam = VALUES(mid_exam),
            quiz = VALUES(quiz),
            assignment = VALUES(assignment),
            final_exam = VALUES(final_exam),
            total_score = VALUES(total_score),
            letter_grade = VALUES(letter_grade),
            gpa = VALUES(gpa)`,
        [
            studentId, courseId,
            mergedMarks.mid_exam, mergedMarks.quiz, mergedMarks.assignment, mergedMarks.final_exam,
            total_score, letter_grade, gpa
        ]
    );

    await recalculateCgpa(studentId);

    const [rows] = await pool.query(
        "SELECT * FROM grades WHERE student_id = ? AND course_id = ?",
        [studentId, courseId]
    );
    return rows[0];
};

const updateGradeById = async (id, marks) => {
    const [existingRows] = await pool.query("SELECT * FROM grades WHERE id = ?", [id]);
    if (existingRows.length === 0) return null;
    const existing = existingRows[0];

    const mergedMarks = {
        mid_exam: marks.mid_exam !== undefined && marks.mid_exam !== "" && marks.mid_exam !== null
            ? Number(marks.mid_exam) : Number(existing.mid_exam || 0),
        quiz: marks.quiz !== undefined && marks.quiz !== "" && marks.quiz !== null
            ? Number(marks.quiz) : Number(existing.quiz || 0),
        assignment: marks.assignment !== undefined && marks.assignment !== "" && marks.assignment !== null
            ? Number(marks.assignment) : Number(existing.assignment || 0),
        final_exam: marks.final_exam !== undefined && marks.final_exam !== "" && marks.final_exam !== null
            ? Number(marks.final_exam) : Number(existing.final_exam || 0)
    };

    const { total_score, letter_grade, gpa } = computeDerived(mergedMarks);

    await pool.execute(
        `UPDATE grades
         SET mid_exam = ?, quiz = ?, assignment = ?, final_exam = ?,
             total_score = ?, letter_grade = ?, gpa = ?
         WHERE id = ?`,
        [mergedMarks.mid_exam, mergedMarks.quiz, mergedMarks.assignment, mergedMarks.final_exam,
         total_score, letter_grade, gpa, id]
    );

    await recalculateCgpa(existing.student_id);

    const [rows] = await pool.query("SELECT * FROM grades WHERE id = ?", [id]);
    return rows[0];
};

const getGradesByStudent = async (studentId) => {
    const [rows] = await pool.query(
        `SELECT
            g.*,
            c.name AS course_name,
            c.code AS course_code,
            COALESCE(c.credit_hours, 3) AS credit_hours,
            c.semester_id,
            s.name AS semester_name,
            s.academic_year
         FROM grades g
         JOIN courses c ON c.id = g.course_id
         LEFT JOIN semesters s ON s.id = c.semester_id
         WHERE g.student_id = ?
         ORDER BY s.created_at ASC, c.name ASC`,
        [studentId]
    );
    return rows;
};

const getGradeByStudentAndCourse = async (studentId, courseId) => {
    const [rows] = await pool.query(
        `SELECT g.*, c.name AS course_name, c.code AS course_code
         FROM grades g
         JOIN courses c ON c.id = g.course_id
         WHERE g.student_id = ? AND g.course_id = ?`,
        [studentId, courseId]
    );
    return rows[0] || null;
};

const getEnrolledStudentsForCourse = async (courseId) => {
    const [rows] = await pool.query(
        `SELECT
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
         ORDER BY s.name ASC`,
        [courseId]
    );
    return rows;
};

const batchUpsertGrades = async (courseId, gradeEntries = []) => {
    const results = [];
    for (const entry of gradeEntries) {
        if (!entry.student_id) continue;
        const res = await upsertGrade(entry.student_id, courseId, entry);
        results.push(res);
    }
    return results;
};

const getGradeById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM grades WHERE id = ?", [id]);
    return rows[0];
};

const deleteGrade = async (id) => {
    const [existingRows] = await pool.query("SELECT student_id FROM grades WHERE id = ?", [id]);
    const [result] = await pool.execute("DELETE FROM grades WHERE id = ?", [id]);
    if (existingRows[0]) await recalculateCgpa(existingRows[0].student_id);
    return result;
};

module.exports = {
    computeDerived,
    recalculateCgpa,
    upsertGrade,
    updateGradeById,
    getGradesByStudent,
    getGradeByStudentAndCourse,
    getEnrolledStudentsForCourse,
    batchUpsertGrades,
    getGradeById,
    deleteGrade
};