/**
 * =====================================================
 * scheduleController.js
 * =====================================================
 */
const scheduleModel = require("../models/scheduleModel");

exports.getAllSchedules = async (req, res, next) => {
    try {
        const schedules = await scheduleModel.getAllSchedules();
        res.json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
        next(error);
    }
};

exports.getMySchedule = async (req, res, next) => {
    try {
        const studentId = req.user.studentId || req.user.student_id;
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student account required" });
        }
        const schedules = await scheduleModel.getSchedulesForStudent(studentId);
        res.json({ success: true, count: schedules.length, data: schedules });
    } catch (error) {
        next(error);
    }
};

exports.getScheduleById = async (req, res, next) => {
    try {
        const schedule = await scheduleModel.getScheduleById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.createSchedule = async (req, res, next) => {
    try {
        const { course_id, day_of_week, start_time, end_time, room, instructor_name } = req.body || {};
        if (!course_id || !day_of_week || !start_time || !end_time || !room) {
            return res.status(400).json({
                success: false,
                message: "Course, day of week, start time, end time, and room are required"
            });
        }
        const result = await scheduleModel.createSchedule({
            course_id: Number(course_id),
            day_of_week,
            start_time,
            end_time,
            room: room.trim(),
            instructor_name: (instructor_name || "Staff").trim()
        });
        res.status(201).json({
            success: true,
            message: "Class schedule created successfully",
            id: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSchedule = async (req, res, next) => {
    try {
        const exists = await scheduleModel.getScheduleById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        await scheduleModel.updateSchedule(req.params.id, req.body || {});
        res.json({ success: true, message: "Schedule updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteSchedule = async (req, res, next) => {
    try {
        const exists = await scheduleModel.getScheduleById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        await scheduleModel.deleteSchedule(req.params.id);
        res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
        next(error);
    }
};
