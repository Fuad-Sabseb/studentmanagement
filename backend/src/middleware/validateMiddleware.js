/**
 * =====================================================
 * validateMiddleware.js
 * -----------------------------------------------------
 * Purpose:
 * Validate request bodies for all API endpoints.
 * Enforces strong password complexity, input formats,
 * numeric bounds, and email/phone standards.
 * =====================================================
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const PHONE_REGEX = /^[+0-9\s()-]{7,20}$/;

/**
 * Password complexity rule:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 */
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function checkPasswordComplexity(password) {
    if (!password || typeof password !== "string") {
        return "Password is required";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
        return "Password must contain at least one special character (!@#$%^&* etc.)";
    }
    return null;
}

/**
 * Validate User Registration payload.
 */
const validateRegisterUser = (req, res, next) => {
    const { username, password, email, role } = req.body || {};
    const errors = [];

    if (!username || typeof username !== "string" || !username.trim()) {
        errors.push("username is required");
    } else if (!USERNAME_REGEX.test(username.trim())) {
        errors.push("username must be 3-30 characters long and can only contain letters, numbers, dots, underscores, and dashes");
    }

    const passwordError = checkPasswordComplexity(password);
    if (passwordError) {
        errors.push(passwordError);
    }

    if (email && typeof email === "string" && email.trim()) {
        if (!EMAIL_REGEX.test(email.trim())) {
            errors.push("email must be a valid email address");
        }
    }

    if (role && !["student", "teacher", "admin"].includes(role)) {
        errors.push("role must be one of 'student', 'teacher', 'admin'");
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
 * Validate Change Password payload.
 */
const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body || {};
    const errors = [];

    if (!currentPassword || typeof currentPassword !== "string") {
        errors.push("currentPassword is required");
    }

    const newPassError = checkPasswordComplexity(newPassword);
    if (newPassError) {
        errors.push(newPassError);
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
        errors.push("New password must be different from current password");
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
 * Validate CREATE student payload.
 */
const validateCreateStudent = (req, res, next) => {
    const { name, email, phone, department_id } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    } else if (name.trim().length > 100) {
        errors.push("name cannot exceed 100 characters");
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.push("email is required");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("email must be a valid email address");
    }

    if (phone && typeof phone === "string" && phone.trim() && !PHONE_REGEX.test(phone.trim())) {
        errors.push("phone must be a valid phone number (7-20 digits)");
    }

    if (department_id !== undefined && department_id !== null && department_id !== "") {
        if (Number.isNaN(Number(department_id))) {
            errors.push("department_id must be a number");
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

const validateUpdateStudent = (req, res, next) => {
    return validateCreateStudent(req, res, next);
};

/**
 * Validate department payload.
 */
const validateDepartment = (req, res, next) => {
    const { name } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    } else if (name.trim().length > 100) {
        errors.push("name cannot exceed 100 characters");
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
 * Validate course payload.
 */
const validateCourse = (req, res, next) => {
    const { name, code, credit_hours, department_id } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push("name is required");
    }

    if (!code || typeof code !== "string" || !code.trim()) {
        errors.push("code is required");
    } else if (code.trim().length > 20) {
        errors.push("code cannot exceed 20 characters");
    }

    if (credit_hours !== undefined && credit_hours !== null && credit_hours !== "") {
        const ch = Number(credit_hours);
        if (Number.isNaN(ch) || ch < 1 || ch > 10) {
            errors.push("credit_hours must be a number between 1 and 10");
        }
    }

    if (department_id !== undefined && department_id !== null && department_id !== "") {
        if (Number.isNaN(Number(department_id))) {
            errors.push("department_id must be a number");
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

/**
 * Validate course assignment payload.
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
 * Validate grade submission payload.
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

/**
 * Validate announcement payload.
 */
const validateAnnouncement = (req, res, next) => {
    const { title, content, priority, audience } = req.body || {};
    const errors = [];

    if (!title || typeof title !== "string" || !title.trim()) {
        errors.push("title is required");
    }
    if (!content || typeof content !== "string" || !content.trim()) {
        errors.push("content is required");
    }
    if (priority && !["normal", "important", "urgent"].includes(priority)) {
        errors.push("priority must be one of 'normal', 'important', 'urgent'");
    }
    if (audience && !["all", "students", "faculty"].includes(audience)) {
        errors.push("audience must be one of 'all', 'students', 'faculty'");
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
    validateRegisterUser,
    validateChangePassword,
    validateCreateStudent,
    validateUpdateStudent,
    validateDepartment,
    validateCourse,
    validateAssignCourse,
    validateGrade,
    validateAnnouncement,
    checkPasswordComplexity,
    PASSWORD_COMPLEXITY_REGEX
};