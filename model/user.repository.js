const pool = require("../db/pool");

class User {
  static async create({ email, password, first_name, last_name }) {
    try {
      await pool.query(
        "INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4)",
        [email, password, first_name, last_name],
      );
    } catch (err) {
      throw err;
    }
  }
  static async existsByEmail(email) {
    try {
      const { rows } = await pool.query(
        `SELECT 1 FROM users WHERE email = $1`,
        [email],
      );
      return rows.length > 0;
    } catch (error) {
      console.error(error);
    }
  }
  static async findById(id) {
    try {
      const query = `SELECT * FROM users WHERE id=$1;`;
      const value = [id];

      const { rows } = await pool.query(query, value);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "usersModel - Error database query Users (getById): ",
        error.message,
      );
    }
  }
  static async findByEmail(email) {
    try {
      const query = `SELECT * FROM users WHERE email=$1;`;
      const value = [email];

      const { rows } = await pool.query(query, value);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "usersModel - Error database query Users (getByEmail): ",
        error.message,
      );
    }
  }
  static async deleteById(id) {
    try {
      const query = "DELETE FROM users WHERE id=$1 RETURNING *";
      const value = [id];

      const { rows } = await pool.query(query, value);
      return rows;
    } catch (error) {
      console.error(
        "usersModel - Error database query (Users: deleteById): ",
        error.message,
      );
    }
  }
  static async updateById({ id, email, first_name, last_name, is_admin }) {
    try {
      const query =
        "UPDATE users Set email = $1, first_name = $2, last_name = $3, is_admin = $4  WHERE id = $5";
      const values = [email, first_name, last_name, is_admin, id];

      await pool.query(query, values);
    } catch (error) {
      console.error(
        "usersModel - Error database query Users (updateById): ",
        error.message,
      );
    }
  }
  static async updatePassword(password, email) {
    try {
      const query = "UPDATE users SET password=$1 WHERE email=$2";
      const values = [password, email];

      await pool.query(query, values);
    } catch (error) {
      console.error(
        "usersModel - Error database query Users (updatePassword): ",
        error.message,
      );
    }
  }
  static async findAll(filter) {
    try {
      const query = `SELECT * FROM users WHERE email ILIKE $1;`;
      const value = [`${filter}%`];

      const { rows } = await pool.query(query, value);
      return rows;
    } catch (error) {
      console.error(
        "userModel - Error database query (filterUsers): ",
        error.message,
      );
    }
  }
}

module.exports = User;
