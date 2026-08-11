const pool = require("../db/pool");

class ForgotPassword {
  static async create(email, selector, hashedToken, expiresAt) {
    try {
      await pool.query(
        `INSERT INTO password_resets (email, selector, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
        [email, selector, hashedToken, expiresAt],
      );
    } catch (err) {
      throw err;
    }
  }
  static async findBySelector(selector) {
    const result = await pool.query(
      `SELECT * FROM password_resets WHERE selector = $1`,
      [selector],
    );
    return result.rows[0] || null;
  }
  static async removeBySelector(selector) {
    await pool.query(`DELETE FROM password_resets WHERE selector = $1`, [
      selector,
    ]);
  }
}

module.exports = ForgotPassword;
