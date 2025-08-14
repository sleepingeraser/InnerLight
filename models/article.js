const { poolPromise, sql } = require("../config/dbConfig");

const Article = {
  async create({ title, content, category }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar(255), title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("category", sql.NVarChar(50), category)
      .query(
        "INSERT INTO Articles (title, content, category) OUTPUT INSERTED.* VALUES (@title, @content, @category)"
      );

    return result.recordset[0];
  },

  async findAll() {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Articles ORDER BY createdAt DESC");

    return result.recordset;
  },

  async findByCategory(category) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("category", sql.NVarChar(50), category)
      .query(
        "SELECT * FROM Articles WHERE category = @category ORDER BY createdAt DESC"
      );

    return result.recordset;
  },

  async findById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Articles WHERE id = @id");

    return result.recordset[0];
  },

  async update(id, { title, content, category }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar(255), title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .input("category", sql.NVarChar(50), category)
      .query(
        "UPDATE Articles SET title = @title, content = @content, category = @category WHERE id = @id"
      );

    return result.rowsAffected[0] > 0;
  },

  async delete(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Articles WHERE id = @id");

    return result.rowsAffected[0] > 0;
  },
};

module.exports = Article;
