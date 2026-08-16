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
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,50}$/;
const TIME_REGEX = /^([01]?\d|2[0-3]):[0-5]\d( ?[AaPp][Mm])?$/;

/**
 * XSS sanitization (output-encoding defence-in-depth).
 * Strips HTML tags and dangerous URI schemes from every string field in
 * req.body before any route handler or validator sees it. React also
 * escapes on render, so stored content cannot execute as HTML.
 */
const sanitizeString = (value) => {
    if (typeof value !== "string") return value;
    return value
        .replace(/<[^>]*>/g, "")
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
};

const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const key of Object.keys(req.body)) {
            req.body[key] = sanitizeString(req.body[key]);
        }
    }
    next();
};

/**
 * Validate the body used to self-register a new account.
 * Required: username (3-50 alphanumeric/underscore), password, confirm_password.
 */
const validateRegister = (req, res, next) => {
    const { username, password, confirm_password } = req.body || {};
    const errors = [];

    if (!username || typeof username !== "string" || !USERNAME_REGEX.test(username.trim())) {
        errors.push("username must be 3-50 characters using letters, numbers, or underscore");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        errors.push("password must be at least 8 characters");
    }

    if (confirm_password === undefined || confirm_password !== password) {
        errors.push("confirm_password must match password");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    next();
};

/**
 * Validate semester create payloads. Required: name.
 */
const validateSemester = (req, res, next) => {
    const { name } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    next();
};

/**
 * Validate schedule create payloads.
 * Required: course_id, day_of_week, start_time, end_time, room.
 */
const validateSchedule = (req, res, next) => {
    const { course_id, day_of_week, start_time, end_time, room } = req.body || {};
    const errors = [];
    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    if (course_id === undefined || course_id === null || course_id === "") {
        errors.push("course_id is required");
    } else if (Number.isNaN(Number(course_id))) {
        errors.push("course_id must be a number");
    }

    if (!day_of_week || typeof day_of_week !== "string") {
        errors.push("day_of_week is required");
    } else if (!DAYS.includes(day_of_week.trim().toLowerCase())) {
        errors.push("day_of_week must be one of: mon, tue, wed, thu, fri, sat, sun");
    }

    if (!start_time || typeof start_time !== "string" || !TIME_REGEX.test(start_time.trim())) {
        errors.push("start_time must be a valid time (HH:MM)");
    }

    if (!end_time || typeof end_time !== "string" || !TIME_REGEX.test(end_time.trim())) {
        errors.push("end_time must be a valid time (HH:MM)");
    }

    if (!room || typeof room !== "string" || !room.trim()) {
        errors.push("room is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    next();
};

/**
 * Validate announcement create payloads.
 * Required: title, content. Optional: priority, audience (allow-listed).
 */
const validateAnnouncement = (req, res, next) => {
    const { title, content, priority, audience } = req.body || {};
    const errors = [];
    const PRIORITIES = ["low", "normal", "high", "urgent"];
    const AUDIENCES = ["all", "students", "teachers", "admin"];

    if (!title || typeof title !== "string" || !title.trim()) {
        errors.push("title is required");
    }

    if (!content || typeof content !== "string" || !content.trim()) {
        errors.push("content is required");
    }

    if (priority !== undefined && priority !== null && priority !== "" && !PRIORITIES.includes(priority)) {
        errors.push("priority must be one of: low, normal, high, urgent");
    }

    if (audience !== undefined && audience !== null && audience !== "" && !AUDIENCES.includes(audience)) {
        errors.push("audience must be one of: all, students, teachers, admin");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    next();
};

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
    sanitizeString,
    sanitizeBody,
    validateRegister,
    validateSemester,
    validateSchedule,
    validateAnnouncement,
    validateCreateStudent,
    validateUpdateStudent,
    validateDepartment,
    validateCourse,
    validateAssignCourse,
    validateGrade
};