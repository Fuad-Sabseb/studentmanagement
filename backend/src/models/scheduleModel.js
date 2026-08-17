/**
 * =====================================================
 * scheduleModel.js
 * -----------------------------------------------------
 * Database operations for weekly class timetables.
 * =====================================================
 */
const { pool } = require("../config/db");

const createSchedule = async ({ course_id, day_of_week, start_time, end_time, room, instructor_name = "Staff" }) => {
    const [result] = await pool.execute(
        `INSERT INTO class_schedules (course_id, day_of_week, start_time, end_time, room, instructor_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [course_id, day_of_week, start_time, end_time, room, instructor_name]
    );
    return result;
};

const getAllSchedules = async () => {
    const [rows] = await pool.query(`
        SELECT
            cs.id,
            cs.course_id,
            cs.day_of_week,
            cs.start_time,
            cs.end_time,
            cs.room,
            cs.instructor_name,
            c.code AS course_code,
            c.name AS course_name,
            c.credit_hours,
            d.name AS department_name
        FROM class_schedules cs
        JOIN courses c ON cs.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        ORDER BY
            CASE cs.day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                ELSE 7
            END,
            cs.start_time ASC
    `);
    return rows;
};

const getSchedulesForStudent = async (studentId) => {
    const [rows] = await pool.query(`
        SELECT
            cs.id,
            cs.course_id,
            cs.day_of_week,
            cs.start_time,
            cs.end_time,
            cs.room,
            cs.instructor_name,
            c.code AS course_code,
            c.name AS course_name,
            c.credit_hours,
            d.name AS department_name
        FROM class_schedules cs
        JOIN courses c ON cs.course_id = c.id
        JOIN student_courses sc ON sc.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        WHERE sc.student_id = ?
        ORDER BY
            CASE cs.day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                ELSE 7
            END,
            cs.start_time ASC
    `, [studentId]);
    return rows;
};

const getScheduleById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM class_schedules WHERE id = ?", [id]);
    return rows[0];
};

const updateSchedule = async (id, { course_id, day_of_week, start_time, end_time, room, instructor_name }) => {
    const [result] = await pool.execute(
        `UPDATE class_schedules
         SET course_id = COALESCE(?, course_id),
             day_of_week = COALESCE(?, day_of_week),
             start_time = COALESCE(?, start_time),
             end_time = COALESCE(?, end_time),
             room = COALESCE(?, room),
             instructor_name = COALESCE(?, instructor_name)
         WHERE id = ?`,
        [course_id || null, day_of_week || null, start_time || null, end_time || null, room || null, instructor_name || null, id]
    );
    return result;
};

const deleteSchedule = async (id) => {
    const [result] = await pool.execute("DELETE FROM class_schedules WHERE id = ?", [id]);
    return result;
};

module.exports = {
    createSchedule,
    getAllSchedules,
    getSchedulesForStudent,
    getScheduleById,
    updateSchedule,
    deleteSchedule
};
