const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

class Otp {
  static async create({ email, otp }) {
    try {
      const { rows } = await pool.query(
        "INSERT INTO otps (email, otp) VALUES ($1, $2) RETURNING *",
        [email, otp],
      );

      return rows[0];
    } catch (error) {
      console.error(
        "otp.reepository - Error database query create: ",
        error.message,
      );
    }
  }
  static async remove(email) {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM otps WHERE email = $1",
        [email],
      );

      return rowCount > 0;
    } catch (error) {
      console.error(
        "otp.reepository - Error database query remove:",
        error.message,
      );
    }
  }
  static async findLatestByEmail(email) {
    const { rows } = await pool.query(
      `
        SELECT *
        FROM otps
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
      [email],
    );

    return rows[0] || null;
  }
}

module.exports = Otp;
