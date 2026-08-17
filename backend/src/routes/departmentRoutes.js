/**
 * =====================================================
 * departmentRoutes.js
 * -----------------------------------------------------
 * Read access: any authenticated user.
 * Mutations: admin only.
 * =====================================================
 */
const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const { requireRole } = require("../middleware/rbacMiddleware");
const { validateDepartment } = require("../middleware/validateMiddleware");

router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);

router.post("/", requireRole("admin"), validateDepartment, departmentController.createDepartment);
router.put("/:id", requireRole("admin"), validateDepartment, departmentController.updateDepartment);
router.delete("/:id", requireRole("admin"), departmentController.deleteDepartment);

module.exports = router;