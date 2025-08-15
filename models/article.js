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

  // paginated and sorted article retrieval
  async findAllPaginated({
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
    category,
  }) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    const validSortColumns = ["title", "createdAt", "category"];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "createdAt";

    let query = "SELECT * FROM Articles";
    const params = [];

    if (category) {
      query += " WHERE category = @category";
      params.push({
        name: "category",
        type: sql.NVarChar(50),
        value: category,
      });
    }

    query += ` ORDER BY ${safeSortBy} ${sortOrder === "ASC" ? "ASC" : "DESC"}`;
    query += " OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

    params.push(
      { name: "offset", type: sql.Int, value: offset },
      { name: "limit", type: sql.Int, value: limit }
    );

    const request = pool.request();
    params.forEach((param) =>
      request.input(param.name, param.type, param.value)
    );

    const result = await request.query(query);
    return {
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await this.count({ category }),
      },
    };
  },

  // helper method for counting articles
  async count({ category } = {}) {
    const pool = await poolPromise;
    let query = "SELECT COUNT(*) as total FROM Articles";
    const request = pool.request();

    if (category) {
      query += " WHERE category = @category";
      request.input("category", sql.NVarChar(50), category);
    }

    const result = await request.query(query);
    return result.recordset[0].total;
  },
};

module.exports = Article;
