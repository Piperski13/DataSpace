const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seed() {
  try {
    await client.connect();

    const adminEmail = process.env.ADMIN_EMAIL;

    const result = await client.query("SELECT 1 FROM users WHERE email = $1", [
      adminEmail,
    ]);

    if (result.rows.length > 0) {
      console.log("Admin user already exists, skipping creation.");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await client.query(
      `INSERT INTO users
        (email, password, first_name, last_name, is_admin)
       VALUES ($1, $2, $3, $4, TRUE)`,
      [
        adminEmail,
        hashedPassword,
        process.env.ADMIN_FIRST_NAME,
        process.env.ADMIN_LAST_NAME,
      ],
    );

    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seed();
