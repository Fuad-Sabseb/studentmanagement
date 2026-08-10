/**
 * =====================================================
 * departmentRoutes.js
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const { validateDepartment } = require("../middleware/validateMiddleware");

router.post("/", validateDepartment, departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", validateDepartment, departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
