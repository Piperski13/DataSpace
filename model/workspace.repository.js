const pool = require("../db/pool");

class Workspace {
  static async create({ name, description, owner_id }) {
    try {
      const query = `INSERT INTO workspaces (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *`;

      const value = [name, description, owner_id];

      const { rows } = await pool.query(query, value);

      return rows[0]; // return new record
    } catch (error) {
      console.error(
        "Workspace Model - Database query failed (create):",
        error.message,
      );
    }
  }
  static async showList(filter, user_id) {
    try {
      const baseQuery = `SELECT * FROM workspaces WHERE name ILIKE $1`;
      const values = [`${filter}%`];

      const query = user_id ? `${baseQuery} AND owner_id = $2` : baseQuery;

      if (user_id) values.push(user_id);

      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error(
        "workspace.repository - Database error (showList):",
        error.message,
      );
      throw error;
    }
  }
  q;
  static async get(id) {
    try {
      const query = `SELECT * FROM workspaces WHERE id=$1;`;
      const value = [id];

      const { rows } = await pool.query(query, value);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "workspace.repository - Error database query (get): ",
        error.message,
      );
    }
  }
  static async update({ workspaceId, name, description }) {
    try {
      const query =
        "UPDATE workspaces Set name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3";
      const values = [name, description, workspaceId];

      await pool.query(query, values);
    } catch (error) {
      console.error(
        "workspace.repository - Error database query (update): ",
        error.message,
      );
    }
  }
  static async remove(id) {
    try {
      const query = "DELETE FROM workspaces WHERE id=$1 RETURNING *";
      const value = [id];

      const { rows } = await pool.query(query, value);
      return rows;
    } catch (error) {
      console.error(
        "workspace.repository - Error database query (remove): ",
        error.message,
      );
    }
  }
}

module.exports = Workspace;
