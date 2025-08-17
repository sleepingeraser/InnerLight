const { poolPromise } = require("../config/dbConfig");
const sql = require("mssql");

beforeAll(async () => {
  // ensure database connection is ready
  await poolPromise;
});

afterAll(async () => {
  const pool = await poolPromise;
  await pool.close();
});
