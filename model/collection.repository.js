const pool = require("../db/pool");

class Collection {
  static async create({ workspaceId, name, description }) {
    //done
    try {
      const query = `INSERT INTO collections (workspace_id, name, description) VALUES ($1,$2,$3) RETURNING *`;

      const value = [workspaceId, name, description];

      const { rows } = await pool.query(query, value);

      return rows[0] || null; // return new record
    } catch (error) {
      console.error(
        "collection.repository - Database query failed (create):",
        error.message,
      );
      throw error;
    }
  }

  static async findOne({ workspaceId, collectionId }) {
    //done
    try {
      const query = `SELECT * FROM collections WHERE workspace_id=$1 AND id=$2;`;
      const value = [workspaceId, collectionId];

      const { rows } = await pool.query(query, value);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "collection.repository- Error database query (findOne): ",
        error.message,
      );
      throw error;
    }
  }

  static async findMany({ workspaceId }) {
    //done
    try {
      const query = `
       SELECT c.*,
       COUNT(r.id) as records_count 
       FROM collections c 
       LEFT JOIN records r 
       ON r.collection_id = c.id 
       WHERE c.workspace_id = $1 
       GROUP BY c.id;`;
      const value = [workspaceId];

      const { rows } = await pool.query(query, value);
      return rows || null;
    } catch (error) {
      console.error(
        "collection.repository- Error database query (findMany): ",
        error.message,
      );
      throw error;
    }
  }

  static async update({ name, description, workspaceId, collectionId }) {
    //done
    try {
      const query =
        "UPDATE collections Set name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = $3 AND id=$4 RETURNING *";
      const values = [name, description, workspaceId, collectionId];

      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "collection.repository - Error database query (update): ",
        error.message,
      );
      throw error;
    }
  }
  static async remove({ workspaceId, collectionId }) {
    //done
    try {
      const query =
        "DELETE FROM collections WHERE workspace_id=$1 AND id=$2 RETURNING *";
      const values = [workspaceId, collectionId];

      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "collection.repository - Error database query (remove): ",
        error.message,
      );
      throw error;
    }
  }
}

module.exports = Collection;
