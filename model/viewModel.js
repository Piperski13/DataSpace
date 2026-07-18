const pool = require("../db/pool");

class View {
  static async getUsers() {
    try {
      const { rows } = await pool.query(`SELECT * FROM users`);

      return rows;
    } catch (error) {
      console.error("viewModel - Database error (getUsers):", error.message);
      throw error;
    }
  }
  static async filterUsers(filter) {
    try {
      const query = `SELECT * FROM users WHERE email ILIKE $1;`;
      const value = [`${filter}%`];

      const { rows } = await pool.query(query, value);
      return rows;
    } catch (error) {
      console.error(
        "viewModel - Error database query (filterUsers): ",
        error.message,
      );
    }
  }
}
module.exports = View;
