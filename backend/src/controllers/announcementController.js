/**
 * =====================================================
 * announcementController.js
 * =====================================================
 */
const announcementModel = require("../models/announcementModel");

exports.getAllAnnouncements = async (req, res, next) => {
    try {
        const audience = req.user.role === "admin" ? null : "students";
        const announcements = await announcementModel.getAllAnnouncements(audience);
        res.json({ success: true, count: announcements.length, data: announcements });
    } catch (error) {
        next(error);
    }
};

exports.getAnnouncementById = async (req, res, next) => {
    try {
        const audience = req.user.role === "admin" ? null : "students";
        const announcement = await announcementModel.getAnnouncementById(req.params.id, audience);
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        res.json({ success: true, data: announcement });
    } catch (error) {
        next(error);
    }
};

exports.createAnnouncement = async (req, res, next) => {
    try {
        const { title, content, priority, audience } = req.body || {};
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }
        const author_name = req.user.username || "Administration";
        const result = await announcementModel.createAnnouncement({
            title: title.trim(),
            content: content.trim(),
            priority: priority || "normal",
            audience: audience || "all",
            author_name
        });
        res.status(201).json({
            success: true,
            message: "Announcement posted successfully",
            id: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAnnouncement = async (req, res, next) => {
    try {
        const exists = await announcementModel.getAnnouncementById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        await announcementModel.updateAnnouncement(req.params.id, req.body || {});
        res.json({ success: true, message: "Announcement updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const exists = await announcementModel.getAnnouncementById(req.params.id);
        if (!exists) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        await announcementModel.deleteAnnouncement(req.params.id);
        res.json({ success: true, message: "Announcement removed successfully" });
    } catch (error) {
        next(error);
    }
};
