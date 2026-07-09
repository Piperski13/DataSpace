const pool = require("../db/pool");

class Workspace {
  static async create({ name, description, user }) {
    try {
      const query = `INSERT INTO workspaces (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *`;

      const value = [name, description, user.id];

      const { rows } = await pool.query(query, value);

      return rows[0]; // return new record
    } catch (error) {
      console.error(
        "workspace.repository - Database query failed (create):",
        error.message,
      );
    }
  }
  static async showList({ filter, user_id }) {
    try {
      let query = `
      SELECT
        w.*,
        COUNT(c.id) AS collections_count
      FROM workspaces w
      LEFT JOIN collections c
        ON c.workspace_id = w.id
      WHERE w.name ILIKE $1
    `;

      const values = [`${filter}%`];

      if (user_id) {
        query += ` AND w.owner_id = $2`;
        values.push(user_id);
      }

      query += `
      GROUP BY w.id
      ORDER BY w.id;
    `;

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
  static async get({ workspaceId }) {
    try {
      const query = `SELECT * FROM workspaces WHERE id=$1;`;
      const value = [workspaceId];

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
        "UPDATE workspaces Set name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;";
      const values = [name, description, workspaceId];

      const { rows } = await pool.query(query, values);

      return rows[0] || null;
    } catch (error) {
      console.error(
        "workspace.repository - Error database query (update): ",
        error.message,
      );
    }
  }
  static async remove({ workspaceId }) {
    try {
      const query = "DELETE FROM workspaces WHERE id=$1 RETURNING *";
      const value = [workspaceId];

      const { rows } = await pool.query(query, value);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "workspace.repository - Error database query (remove): ",
        error.message,
      );
    }
  }
}

module.exports = Workspace;
