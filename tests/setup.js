const { poolPromise, sql } = require('../config/dbConfig');

module.exports = async () => {
  console.log('Global setup - cleaning database...');
  try {
    const pool = await poolPromise;
    await pool.request().query('DELETE FROM Appointments');
    await pool.request().query('DELETE FROM Journals');
    await pool.request().query('DELETE FROM Articles');
    await pool.request().query('DELETE FROM Users');
    console.log('Global setup complete');
  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
};