/**
 * =====================================================
 * courseController.js
 * -----------------------------------------------------
 * Purpose:
 * Handle HTTP requests and responses for courses.
 * =====================================================
 */

const courseModel = require("../models/courseModel");

exports.createCourse = async (req, res, next) => {
    try {
        const result = await courseModel.createCourse(req.body);

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A course with this code already exists"
            });
        }

        next(error);
    }
};

exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseModel.getAllCourses();

        res.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourseById = async (req, res, next) => {
    try {
        const course = await courseModel.getCourseById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const course = await courseModel.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        await courseModel.updateCourse(req.params.id, req.body);

        res.json({ success: true, message: "Course updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await courseModel.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        await courseModel.deleteCourse(req.params.id);

        res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        next(error);
    }
};
