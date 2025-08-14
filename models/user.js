const { poolPromise, sql } = require("../config/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = {
  async create({ username, email, password, role = "user" }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("username", sql.NVarChar(50), username)
      .input("email", sql.NVarChar(255), email)
      .input("password", sql.NVarChar(255), hashedPassword)
      .input("role", sql.NVarChar(10), role)
      .query(
        "INSERT INTO Users (username, email, password, role) OUTPUT INSERTED.* VALUES (@username, @email, @password, @role)"
      );

    return result.recordset[0];
  },

  async findByEmail(email) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar(255), email)
      .query("SELECT * FROM Users WHERE email = @email");

    return result.recordset[0];
  },

  async findById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Users WHERE id = @id");

    return result.recordset[0];
  },

  generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
};

module.exports = User;
