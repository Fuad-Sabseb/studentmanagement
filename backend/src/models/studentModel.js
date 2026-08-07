/**
 * =====================================================
 * studentModel.js
 * -----------------------------------------------------
 * Purpose:
 * Handle all database operations for students table.
 *
 * Responsibilities:
 * - Insert student
 * - Get students
 * - Get student by ID
 * - Update student
 * - Delete student
 * =====================================================
 */


// Import database connection pool
const { pool } = require("../config/db");



/**
 * =====================================================
 * CREATE STUDENT
 * =====================================================
 *
 * Insert new student into database
 *
 */

const createStudent = async(student)=>{


    const sql = `
        INSERT INTO students
        (name,email,department,phone)

        VALUES (?,?,?,?)
    `;


    const values=[

        student.name,

        student.email,

        student.department,
        student.phone

    ];



    const [result] = await pool.execute(
        sql,
        values
    );


    return result;

};





/**
 * =====================================================
 * GET ALL STUDENTS
 * =====================================================
 */

const getAllStudents = async()=>{


    const [rows] = await pool.execute(

        "SELECT * FROM students"

    );


    return rows;

};





/**
 * =====================================================
 * GET STUDENT BY ID
 * =====================================================
 */

const getStudentById = async(id)=>{


    const [rows] = await pool.execute(

        "SELECT * FROM students WHERE id=?",

        [id]

    );


    return rows[0];

};

const getStudentsByDepartment = async(dept)=>{

    const [rows] = await pool.execute(

        "SELECT * FROM students WHERE department=?",

        [dept]

    );

    return rows;
};



/**
 * =====================================================
 * UPDATE STUDENT
 * =====================================================
 */

const updateStudent = async(id,student)=>{


    const sql=`

        UPDATE students

        SET name=?,
            email=?,
            department=?,
            phone=?

        WHERE id=?

    `;


    const values=[

        student.name,

        student.email,

        student.department,

        student.phone,

        id

    ];



    const [result]=await pool.execute(

        sql,

        values

    );


    return result;

};





/**
 * =====================================================
 * DELETE STUDENT
 * =====================================================
 */

const deleteStudent=async(id)=>{


    const [result]=await pool.execute(

        "DELETE FROM students WHERE id=?",

        [id]

    );


    return result;

};





// Export functions
module.exports={

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByDepartment,

    updateStudent,

    deleteStudent

};