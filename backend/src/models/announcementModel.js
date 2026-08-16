/**
 * =====================================================
 * announcementModel.js
 * -----------------------------------------------------
 * Database operations for the announcements table.
 * =====================================================
 */
const { pool } = require("../config/db");

const createAnnouncement = async ({ title, content, priority = "normal", audience = "all", author_name = "Administration" }) => {
    const [result] = await pool.execute(
        `INSERT INTO announcements (title, content, priority, audience, author_name)
         VALUES (?, ?, ?, ?, ?)`,
        [title, content, priority, audience, author_name]
    );
    return result;
};

const getAllAnnouncements = async (audience = null) => {
    let sql = `
        SELECT id, title, content, priority, audience, author_name, created_at, updated_at
        FROM announcements
    `;
    const params = [];

    if (audience && audience !== "all") {
        sql += " WHERE audience = 'all' OR audience = ?";
        params.push(audience);
    }

    sql += " ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'important' THEN 2 ELSE 3 END, created_at DESC";

    const [rows] = await pool.query(sql, params);
    return rows;
};

const getAnnouncementById = async (id, audience = null) => {
    let sql = "SELECT * FROM announcements WHERE id = ?";
    const params = [id];

    // Non-admin callers must not read announcements aimed exclusively at admins.
    if (audience && audience !== "all") {
        sql += " AND (audience = 'all' OR audience = ?)";
        params.push(audience);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0];
};

const updateAnnouncement = async (id, { title, content, priority, audience }) => {
    const [result] = await pool.execute(
        `UPDATE announcements
         SET title = COALESCE(?, title),
             content = COALESCE(?, content),
             priority = COALESCE(?, priority),
             audience = COALESCE(?, audience)
         WHERE id = ?`,
        [title || null, content || null, priority || null, audience || null, id]
    );
    return result;
};

const deleteAnnouncement = async (id) => {
    const [result] = await pool.execute("DELETE FROM announcements WHERE id = ?", [id]);
    return result;
};

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
};
