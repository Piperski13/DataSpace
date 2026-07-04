const pool = require("../db/pool");

class Login {
  static async addUser(email, password, first_name, last_name) {
    try {
      await pool.query(
        "INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4)",
        [email, password, first_name, last_name],
      );
    } catch (err) {
      throw err;
    }
  }
  static async emailExists(email) {
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
}

module.exports = Login;
