const pool = require("../db/pool");

class Record {
  static async create({ collectionId, title, description }) {
    try {
      const query = `INSERT INTO records (collection_id, title, description) VALUES ($1,$2,$3) RETURNING *`;

      const value = [collectionId, title, description];

      const { rows } = await pool.query(query, value);

      return rows[0] || null;
    } catch (error) {
      console.error(
        "record.repository - Database query failed (create):",
        error.message,
      );
      throw error;
    }
  }

  static async findOne({ collectionId, recordId }) {
    try {
      const query = `
      SELECT
        r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'filename', f.filename,
              'original_name', f.original_name,
              'path', f.path,
              'mimetype', f.mimetype,
              'size', f.size
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) AS files
      FROM records r
      LEFT JOIN files f
        ON f.record_id = r.id
      WHERE r.collection_id = $1
        AND r.id = $2
      GROUP BY r.id;
    `;

      const values = [collectionId, recordId];

      const { rows } = await pool.query(query, values);

      return rows[0] || null;
    } catch (error) {
      console.error(
        "Record Repository - Database query failed (findOne):",
        error.message,
      );

      throw error;
    }
  }

  static async findMany({ collectionId, filter }) {
    try {
      const query = `
        SELECT
          r.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'filename', f.filename,
                'original_name', f.original_name,
                'path', f.path,
                'mimetype', f.mimetype,
                'size', f.size
              )
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'
          ) AS files
        FROM records r
        LEFT JOIN files f
          ON f.record_id = r.id
        WHERE r.collection_id = $1
        AND 
        r.title ILIKE $2
        GROUP BY r.id;
      `;

      const values = [collectionId, `${filter}%`];

      const { rows } = await pool.query(query, values);

      return rows;
    } catch (error) {
      console.error(
        "Record Repository - Database query failed (findWithFiles):",
        error.message,
      );

      throw error;
    }
  }

  static async update({ title, description, collectionId, recordId }) {
    try {
      const query =
        "UPDATE records Set title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE collection_id = $3 AND id=$4 RETURNING *";
      const values = [title, description, collectionId, recordId];

      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "record.repository - Error database query (update): ",
        error.message,
      );
      throw error;
    }
  }
  static async remove({ collectionId, recordId }) {
    try {
      const query =
        "DELETE FROM records WHERE collection_id=$1 AND id=$2 RETURNING *";
      const values = [collectionId, recordId];

      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error(
        "record.repository - Error database query (remove): ",
        error.message,
      );
      throw error;
    }
  }
}

module.exports = Record;
