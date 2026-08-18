require("dotenv").config();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "cohort_university_super_secret_jwt_key_2026_production";
process.env.ADMIN_REGISTRATION_KEY = "cohort_admin_secure_key_2026";
