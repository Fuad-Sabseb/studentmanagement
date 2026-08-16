/**
 * =====================================================
 * gradeController.js
 * -----------------------------------------------------
 * Admin: enter/update/delete grades for any student.
 * Student: view only their own grade portal.
 * =====================================================
 */
const gradeModel = require("../models/gradeModel");
const studentModel = require("../models/studentModel");
const courseModel = require("../models/courseModel");

/**
 * POST /api/grades  (admin)
 * Body: { student_id, course_id, mid_exam, quiz, assignment, final_exam }
 */
exports.enterGrade = async (req, res, next) => {
    try {
        const { student_id, course_id, mid_exam, quiz, assignment, final_exam } = req.body || {};

        if (!student_id || !course_id) {
            return res.status(400).json({ success: false, message: "student_id and course_id are required" });
        }

        const studentExists = await studentModel.studentExists(student_id);
        if (!studentExists) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const course = await courseModel.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (!(await gradeModel.isStudentEnrolled(student_id, course_id))) {
            return res.status(400).json({ success: false, message: "Student is not enrolled in this course" });
        }

        const grade = await gradeModel.upsertGrade(student_id, course_id, {
            mid_exam, quiz, assignment, final_exam
        });

        res.status(201).json({ success: true, message: "Grade saved successfully", data: grade });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/grades/:id  (admin)
 */
exports.updateGrade = async (req, res, next) => {
    try {
        const updated = await gradeModel.updateGradeById(req.params.id, req.body || {});
        if (!updated) {
            return res.status(404).json({ success: false, message: "Grade record not found" });
        }
        res.json({ success: true, message: "Grade updated successfully", data: updated });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/grades/:id  (admin)
 */
exports.deleteGrade = async (req, res, next) => {
    try {
        await gradeModel.deleteGrade(req.params.id);
        res.json({ success: true, message: "Grade record deleted" });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/grades/student/:studentId  (admin, or the owning student)
 */
exports.getGradesForStudent = async (req, res, next) => {
    try {
        const studentExists = await studentModel.studentExists(req.params.studentId);
        if (!studentExists) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        const grades = await gradeModel.getGradesByStudent(req.params.studentId);
        res.json({ success: true, count: grades.length, data: grades });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/grades/student/:studentId/course/:courseId (admin or owning student)
 */
exports.getGradeByStudentAndCourse = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.params;
        const grade = await gradeModel.getGradeByStudentAndCourse(studentId, courseId);
        res.json({ success: true, data: grade });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/grades/course/:courseId (admin)
 * List all enrolled students for a course along with their existing marks
 */
exports.getCourseStudentsAndGrades = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await courseModel.getCourseById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const enrolled = await gradeModel.getEnrolledStudentsForCourse(courseId);
        res.json({
            success: true,
            count: enrolled.length,
            course,
            data: enrolled
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/grades/batch (admin)
 * Body: { course_id, grades: [ { student_id, mid_exam, quiz, assignment, final_exam }, ... ] }
 */
exports.batchEnterGrades = async (req, res, next) => {
    try {
        const { course_id, grades } = req.body || {};
        if (!course_id || !Array.isArray(grades)) {
            return res.status(400).json({ success: false, message: "course_id and grades array are required" });
        }

        const course = await courseModel.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const updated = await gradeModel.batchUpsertGrades(course_id, grades);
        res.status(201).json({
            success: true,
            message: `Successfully saved marks for ${updated.length} student(s)`,
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/grades/my-grades  (student — self-service, no :id param so no IDOR surface)
 */
exports.getMyGrades = async (req, res, next) => {
    try {
        const studentId = req.user.studentId || req.user.student_id;
        if (req.user.role !== "student" || !studentId) {
            return res.status(403).json({ success: false, message: "Only students have a grade portal" });
        }
        const grades = await gradeModel.getGradesByStudent(studentId);
        res.json({ success: true, count: grades.length, data: grades });
    } catch (error) {
        next(error);
    }
};