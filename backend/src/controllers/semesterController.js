/**
 * =====================================================
 * semesterController.js
 * =====================================================
 */
const semesterModel = require("../models/semesterModel");

exports.getAllSemesters = async (req, res, next) => {
    try {
        const semesters = await semesterModel.getAllSemesters();
        res.json({ success: true, count: semesters.length, data: semesters });
    } catch (error) {
        next(error);
    }
};

exports.getSemesterById = async (req, res, next) => {
    try {
        const semester = await semesterModel.getSemesterById(req.params.id);
        if (!semester) {
            return res.status(404).json({ success: false, message: "Semester not found" });
        }
        res.json({ success: true, data: semester });
    } catch (error) {
        next(error);
    }
};

exports.createSemester = async (req, res, next) => {
    try {
        const { name, academic_year, is_current } = req.body || {};
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Semester name is required" });
        }
        const result = await semesterModel.createSemester({
            name: name.trim(),
            academic_year: (academic_year || "2025/2026").trim(),
            is_current: Boolean(is_current)
        });
        res.status(201).json({
            success: true,
            message: "Academic semester created successfully",
            id: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSemester = async (req, res, next) => {
    try {
        const exists = await semesterModel.getSemesterById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Semester not found" });
        }
        await semesterModel.updateSemester(req.params.id, req.body || {});
        res.json({ success: true, message: "Semester updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteSemester = async (req, res, next) => {
    try {
        const exists = await semesterModel.getSemesterById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Semester not found" });
        }
        await semesterModel.deleteSemester(req.params.id);
        res.json({ success: true, message: "Semester deleted successfully" });
    } catch (error) {
        next(error);
    }
};
