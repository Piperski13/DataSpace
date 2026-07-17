const pool = require("../db/pool");

class File {
  static async create(fileRows) {
    try {
      let insertedFiles = [];

      for (const file of fileRows) {
        const query = `
          INSERT INTO files 
          (record_id, filename, original_name, path, mimetype, size, created_at, updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING *;
        `;

        const values = [
          file.record_id,
          file.filename,
          file.original_name,
          file.path,
          file.mimetype,
          file.size,
          file.created_at,
          file.updated_at,
        ];

        const { rows } = await pool.query(query, values);
        insertedFiles.push(rows[0]);
      }

      return insertedFiles;
    } catch (error) {
      console.error(
        "Files Repository - Database query failed (create):",
        error.message,
      );
    }
  }
  static async removeMany(deletedFiles) {
    try {
      const query = `
      DELETE FROM files
      WHERE id = ANY($1::int[])
      RETURNING *;
    `;

      const values = [deletedFiles];

      const { rows } = await pool.query(query, values);

      return rows;
    } catch (error) {
      console.error(
        "Files Repository - Error database query (removeMany):",
        error.message,
      );
      throw error;
    }
  }
  static async getByRecordId(recordId) {
    try {
      const query = `SELECT * FROM files WHERE record_id = $1`;
      const { rows } = await pool.query(query, [recordId]);
      return rows;
    } catch (error) {
      console.error(
        "Files Repository - Error database error (getByRecordId):",
        error.message,
      );
      throw error;
    }
  }
  static async getByCollectionId(collectionId) {
    try {
      const query = `SELECT f.* FROM files f JOIN records r ON r.id = f.record_id WHERE r.collection_id=$1`;
      const { rows } = await pool.query(query, [collectionId]);
      return rows;
    } catch (error) {
      console.error(
        "Files Repository - Error database error (getByCollectionId):",
        error.message,
      );
      throw error;
    }
  }
  // static async deleteByRecordId(recordId) {
  //   try {
  //     const query = `DELETE FROM files WHERE record_id = $1`;
  //     return pool.query(query, [recordId]);
  //   } catch (error) {
  //     console.error(
  //       "Files Repository - Error database error (deleteByRecordId):",
  //       error.message,
  //     );
  //     throw error;
  //   }
  // }
}

module.exports = File;
