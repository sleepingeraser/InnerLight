const { poolPromise } = require("../config/dbConfig");

module.exports = async () => {
  console.log("Global teardown - closing database...");
  try {
    const pool = await poolPromise;
    await pool.close();
    console.log("Global teardown complete");
  } catch (err) {
    console.error("Global teardown failed:", err);
  }
};
