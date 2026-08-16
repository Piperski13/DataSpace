const pool = require("../db/pool");

class Chat {
  static async createMessage(userId, username, text) {
    try {
      const result = await pool.query(
        `INSERT INTO chat_messages (user_id, username, message)
     VALUES ($1, $2, $3)
     RETURNING id, username, message, created_at`,
        [userId, username, text],
      );

      return result.rows[0];
    } catch (error) {
      console.error(
        "ChatModel - Database error (createMessage):",
        error.message,
      );
      throw error;
    }
  }
  static async getMessages() {
    try {
      const { rows } = await pool.query(
        `SELECT username, message, created_at FROM chat_messages ORDER BY created_at ASC LIMIT 50`,
      );

      return rows;
    } catch (error) {
      console.error("ChatModel - Database error (getMessages):", error.message);
      throw error;
    }
  }
  static async deleteAllMessages() {
    try {
      const result = await pool.query(`DELETE from chat_messages;`);
      return result.rowCount > 0;
    } catch (error) {
      console.error(
        "ChatModel - Database error (DeleteAllMessages()):",
        error.message,
      );
      throw error;
    }
  }
}

module.exports = Chat;
