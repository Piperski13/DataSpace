const pool = require("../db/pool");

class View {
  static async filterRecords(filter, user_id) {
    try {
      const baseQuery = `SELECT * FROM evidencijaelektrana WHERE nazivelektrane ILIKE $1`;
      const values = [`${filter}%`];

      const query = user_id ? `${baseQuery} AND user_id = $2` : baseQuery;

      if (user_id) values.push(user_id);

      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error(
        "viewModel - Database error (filterRecords):",
        error.message,
      );
      throw error;
    }
  }
  //Number of total plants filtered on the screen
  static async getAllPlants(filter, user_id) {
    try {
      let baseQuery = `
      SELECT 
        v.sifra, 
        v.naziv, 
        COUNT(e.id) AS ukupanbrojelektrana
      FROM vrstapogona v
      LEFT JOIN evidencijaelektrana e
        ON e.sifravrstepogona = v.sifra
    `;

      const conditions = [];
      const values = [];

      if (filter) {
        values.push(`${filter}%`);
        conditions.push(`e.nazivelektrane ILIKE $${values.length}`);
      }

      if (user_id) {
        values.push(user_id);
        conditions.push(`e.user_id = $${values.length}`);
      }

      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      baseQuery += ` GROUP BY v.sifra, v.naziv ORDER BY v.sifra ASC`;

      const { rows } = await pool.query(baseQuery, values);
      return rows;
    } catch (error) {
      console.error(
        "viewModel - Database error (getAllPlants):",
        error.message,
      );
      throw error;
    }
  }
  static async getUsers() {
    try {
      const { rows } = await pool.query(`SELECT * FROM users`);

      return rows;
    } catch (error) {
      console.error("viewModel - Database error (getUsers):", error.message);
      throw error;
    }
  }
  static async filterUsers(filter) {
    try {
      const query = `SELECT * FROM users WHERE email ILIKE $1;`;
      const value = [`${filter}%`];

      const { rows } = await pool.query(query, value);
      return rows;
    } catch (error) {
      console.error(
        "viewModel - Error database query (filterUsers): ",
        error.message,
      );
    }
  }
}
module.exports = View;
