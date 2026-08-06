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
      console.error("otpModel - Error database query create: ", error.message);
    }
  }
  static async removeOtp(email) {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM otps WHERE email = $1",
        [email],
      );

      return rowCount > 0;
    } catch (error) {
      console.error(
        "otpModel - Error database query removeOtp:",
        error.message,
      );
    }
  }
  static async verifyOtp(email, otp) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
        [email],
      );

      if (!rows.length) return { valid: false, reason: "invalid" };

      const isMatch = await bcrypt.compare(otp, rows[0].otp);
      if (!isMatch) return { valid: false, reason: "invalid" };

      const createdAt = new Date(rows[0].created_at);
      const now = new Date();
      const diff = (now - createdAt) / 1000 / 60;

      if (diff > 5) return { valid: false, reason: "expired" };

      return { valid: true };
    } catch (error) {
      console.error(
        "otpModel - Error database query verifyOtp:",
        error.message,
      );
      throw error;
    }
  }
}

module.exports = Otp;
