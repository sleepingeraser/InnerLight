const { poolPromise, sql } = require("../config/dbConfig");

const Journal = {
  async create({ userId, title, content }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("title", sql.NVarChar(255), title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .query(
        "INSERT INTO Journals (userId, title, content) OUTPUT INSERTED.* VALUES (@userId, @title, @content)"
      );

    return result.recordset[0];
  },

  async findByUserId(userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT * FROM Journals WHERE userId = @userId ORDER BY createdAt DESC"
      );

    return result.recordset;
  },

  async findById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Journals WHERE id = @id");

    return result.recordset[0];
  },

  async update(id, { title, content }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("title", sql.NVarChar(255), title)
      .input("content", sql.NVarChar(sql.MAX), content)
      .query(
        "UPDATE Journals SET title = @title, content = @content WHERE id = @id"
      );

    return result.rowsAffected[0] > 0;
  },

  async delete(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Journals WHERE id = @id");

    return result.rowsAffected[0] > 0;
  },
};

module.exports = Journal;
