const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Automatically create 'members' table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    previous_payment DECIMAL,
    payment_amount DECIMAL,
    payment_date DATE,
    payment_agent VARCHAR(100)
  );
`;

pool
  .query(createTableQuery)
  .then(() => {
    console.log("Table 'members' is ready or already exists.");
  })
  .catch((err) => {
    console.error("Error creating table:", err);
  });

module.exports = pool;
