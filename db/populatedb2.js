const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const SQL = `
-- Create tables

CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE IF NOT EXISTS workspaces (

    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workspace_owner

        FOREIGN KEY(owner_id)

        REFERENCES users(id)

        ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS collections (

    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    workspace_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_collection_workspace

        FOREIGN KEY(workspace_id)

        REFERENCES workspaces(id)

        ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS records (

    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    collection_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_record_collection

        FOREIGN KEY(collection_id)

        REFERENCES collections(id)

        ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS files (

    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    record_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file_record

        FOREIGN KEY(record_id)

        REFERENCES records(id)

        ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(255) NOT NULL, -- hash will be longer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL,
  selector VARCHAR(32) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL, 
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_selector 
  ON password_resets(selector);

CREATE INDEX IF NOT EXISTS idx_password_resets_email 
  ON password_resets(email);
`;

async function main() {
  console.log("Seeding database...");

  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING,
  });

  try {
    await client.connect();
    await client.query(SQL);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminExists = await client.query(
      "SELECT * FROM Users WHERE email = $1",
      [adminEmail],
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await client.query(
        `INSERT INTO Users (email, password, first_name, last_name, is_admin, created_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW())`,
        [
          adminEmail,
          hashedPassword,
          process.env.ADMIN_FIRST_NAME,
          process.env.ADMIN_LAST_NAME,
        ],
      );

      console.log("✅ Admin user created successfully!");
    } else {
      console.log("ℹ️ Admin user already exists, skipping creation.");
    }

    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Error seeding database: ", err);
  } finally {
    await client.end();
  }
}

main();
