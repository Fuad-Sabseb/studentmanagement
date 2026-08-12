/**
 * =====================================================
 * validateMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Validate request bodies for the Student, Department,
 * Course, and Grade endpoints. Returns HTTP 400 when
 * required fields are missing or malformed.
 * =====================================================
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the body used to CREATE a student.
 * Required: name, email
 * Optional: phone, department_id
 */
const validateCreateStudent = (req, res, next) => {
    const { name, email } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.push("email is required");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("email must be a valid email address");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};

/**
 * Validate the body used to UPDATE a student.
 * Same required fields as create (full replace semantics),
 * matching the existing PUT /api/students/:id contract.
 */
const validateUpdateStudent = (req, res, next) => {
    return validateCreateStudent(req, res, next);
};

/**
 * Validate department create/update payloads.
 * Required: name
 */
const validateDepartment = (req, res, next) => {
    const { name } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};

/**
 * Validate course create/update payloads.
 * Required: name, code
 */
const validateCourse = (req, res, next) => {
    const { name, code } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    }

    if (!code || typeof code !== "string" || !code.trim()) {
        errors.push("code is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};

/**
 * Validate the payload used to assign a course to a student.
 * Required: course_id
 */
const validateAssignCourse = (req, res, next) => {
    const { course_id } = req.body || {};
    const errors = [];

    if (course_id === undefined || course_id === null || course_id === "") {
        errors.push("course_id is required");
    } else if (Number.isNaN(Number(course_id))) {
        errors.push("course_id must be a number");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};

/**
 * Validate grade entry payloads.
 * Required: student_id, course_id
 * Marks (mid_exam, quiz, assignment, final_exam) are optional but,
 * if present, must be numbers between 0 and 100.
 */
const validateGrade = (req, res, next) => {
    const { student_id, course_id, mid_exam, quiz, assignment, final_exam } = req.body || {};
    const errors = [];

    if (!student_id || Number.isNaN(Number(student_id))) {
        errors.push("student_id is required and must be a number");
    }
    if (!course_id || Number.isNaN(Number(course_id))) {
        errors.push("course_id is required and must be a number");
    }

    for (const [field, value] of Object.entries({ mid_exam, quiz, assignment, final_exam })) {
        if (value !== undefined && value !== null && value !== "") {
            const n = Number(value);
            if (Number.isNaN(n) || n < 0 || n > 100) {
                errors.push(`${field} must be a number between 0 and 100`);
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    next();
};

module.exports = {
    validateCreateStudent,
    validateUpdateStudent,
    validateDepartment,
    validateCourse,
    validateAssignCourse,
    validateGrade
};