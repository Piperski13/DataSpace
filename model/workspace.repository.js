const pool = require("../db/pool");

class Workspace {
  static async create({ name, description, visibility, user }) {
    try {
      const query = `INSERT INTO workspaces (name, description,visibility, owner_id) VALUES ($1,$2,$3,$4) RETURNING *`;

      const value = [name, description, visibility, user.id];

      const { rows } = await pool.query(query, value);

      return rows[0]; // return new record
    } catch (error) {
      console.error(
        "workspace.repository - Database query failed (create):",
        error.message,
      );
    }
  }
  static async showList({ filter, user }) {
    try {
      let query = `
      SELECT
        w.*,
        COUNT(c.id) AS collections_count
      FROM workspaces w
      LEFT JOIN collections c
        ON c.workspace_id = w.id
      WHERE (w.visibility = $1 OR w.owner_id = $2)
      AND w.name ILIKE $3
      GROUP BY w.id
      ORDER BY w.id;
    `;

      const values = ["public", user.id, `${filter}%`];

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
  static async update({ workspaceId, name, description, visibility }) {
    try {
      const query =
        "UPDATE workspaces Set name = $1, description = $2, visibility = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;";
      const values = [name, description, visibility, workspaceId];

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
