const { poolPromise, sql } = require("../config/dbConfig");

const Appointment = {
  async create({ userId, scheduledAt }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("scheduledAt", sql.DateTime, scheduledAt)
      .query(
        "INSERT INTO Appointments (userId, status, scheduledAt) OUTPUT INSERTED.* VALUES (@userId, 'pending', @scheduledAt)"
      );

    return result.recordset[0];
  },

  async findByUserId(userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT * FROM Appointments WHERE userId = @userId ORDER BY scheduledAt DESC"
      );

    return result.recordset;
  },

  async findAll() {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Appointments ORDER BY scheduledAt DESC");

    return result.recordset;
  },

  async findById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Appointments WHERE id = @id");

    return result.recordset[0];
  },

  async updateStatus(id, status) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar(20), status)
      .query("UPDATE Appointments SET status = @status WHERE id = @id");

    return result.rowsAffected[0] > 0;
  },

  async delete(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Appointments WHERE id = @id");

    return result.rowsAffected[0] > 0;
  },
};

module.exports = Appointment;
