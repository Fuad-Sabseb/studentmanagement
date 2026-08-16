process.env.NODE_ENV = "test";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "3306";
process.env.DB_NAME = "student_management_test";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "test";

module.exports = {
    // Unit test suites only. The integration suites under tests/integration and
    // src/tests are legacy artifacts that require `supertest` + a live database
    // and are intentionally excluded so `npm test` is deterministic offline.
    testMatch: ["**/tests/unit/**/*.test.js"],
    testPathIgnorePatterns: ["/node_modules/", "/src/tests/"]
};
