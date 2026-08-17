const { Client } = require("pg");
require("dotenv").config();

const databaseName = process.env.DB_DATABASE;

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: "postgres",
});

async function createDatabase() {
  try {
    await client.connect();

    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );

    if (result.rows.length > 0) {
      console.log(`Database "${databaseName}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE "${databaseName}"`);

    console.log(`Database "${databaseName}" created successfully.`);
  } catch (error) {
    console.error("Error creating database:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

createDatabase();
