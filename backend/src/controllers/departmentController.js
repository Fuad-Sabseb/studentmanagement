/**
 * =====================================================
 * departmentController.js
 * -----------------------------------------------------
 * Purpose:
 * Handle HTTP requests and responses for departments.
 * =====================================================
 */

const departmentModel = require("../models/departmentModel");

exports.createDepartment = async (req, res, next) => {
    try {
        const result = await departmentModel.createDepartment(req.body);

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "A department with this name already exists"
            });
        }

        next(error);
    }
};

exports.getAllDepartments = async (req, res, next) => {
    try {
        const departments = await departmentModel.getAllDepartments();

        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        next(error);
    }
};

exports.getDepartmentById = async (req, res, next) => {
    try {
        const department = await departmentModel.getDepartmentById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async (req, res, next) => {
    try {
        const department = await departmentModel.getDepartmentById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        await departmentModel.updateDepartment(req.params.id, req.body);

        res.json({ success: true, message: "Department updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        const department = await departmentModel.getDepartmentById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        await departmentModel.deleteDepartment(req.params.id);

        res.json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        next(error);
    }
};
