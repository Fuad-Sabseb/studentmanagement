/**
 * =====================================================
 * studentRoutes.js
 * -----------------------------------------------------
 * Purpose:
 * Define all student API endpoints.
 *
 * Routes connect:
 *
 * HTTP Request
 *        |
 *        ↓
 * Controller Function
 *
 * =====================================================
 */


// Import express router
const express = require("express");


// Create router object
const router = express.Router();


// Import controller functions
const studentController = require("../controllers/studentController");



/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * POST
 *
 * URL:
 * /api/students
 *
 * Request Body:
 *
 * {
 *   "name":"Abebe",
 *   "email":"abebe@gmail.com",
 *   "department":"Computer Science"
 * }
 *
 */

router.get('/students/count', studentController.getStudentCount);
//** */

router.post("/",studentController.createStudent);




/**
 * =====================================================
 * GET ALL STUDENTS
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students
 *
 */

router.get( "/",studentController.getAllStudents);





router.get("/department/:dept",studentController.getStudentsByDepartment
);
/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 *
 * HTTP Method:
 * GET
 *
 * URL:
 * /api/students/:id
 *
 * Example:
 *
 * /api/students/1
 *
 */

router.get("/count", studentController.countStudents);





router.get("/:id",studentController.getStudentById);





/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * PUT
 *
 * URL:
 * /api/students/:id
 *
 * Example:
 *
 * PUT /api/students/1
 *
 */

router.put("/:id",studentController.updateStudent);






/**
 * =====================================================
 * DELETE STUDENT
 * =====================================================
 *
 * HTTP Method:
 * DELETE
 *
 * URL:
 * /api/students/:id
 *
 */

router.delete("/:id",studentController.deleteStudent);





// Export router
module.exports = router;