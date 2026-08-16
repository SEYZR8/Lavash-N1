const { Pool } = require("pg");

require("dotenv").config();

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL mavjud emas.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
});

pool.on("error", error => {
    console.error("PostgreSQL error:", error);
});

module.exports = pool;
