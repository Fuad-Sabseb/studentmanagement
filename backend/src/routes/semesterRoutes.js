/**
 * =====================================================
 * semesterRoutes.js
 * =====================================================
 */
const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");
const { requireRole } = require("../middleware/rbacMiddleware");
const { validateSemester } = require("../middleware/validateMiddleware");

// Any authenticated user can read semesters
router.get("/", semesterController.getAllSemesters);
router.get("/:id", semesterController.getSemesterById);

// Admin-only mutations
router.post("/", requireRole("admin"), validateSemester, semesterController.createSemester);
router.put("/:id", requireRole("admin"), semesterController.updateSemester);
router.delete("/:id", requireRole("admin"), semesterController.deleteSemester);

module.exports = router;
