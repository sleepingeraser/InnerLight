const { poolPromise } = require("../config/dbConfig");

let pool;
beforeAll(async () => {
  pool = await poolPromise;
  try {
    await pool.request().query(`
      DELETE FROM Appointments;
      DELETE FROM Journals;
      DELETE FROM Articles;
      DELETE FROM Users;
      
      INSERT INTO Users (username, email, password, role)
      VALUES 
        ('Koyuki', 'koyukisky18@gmail.com', '$2a$10$Co3yEns5VAf0hHvw1/IsHOdISZZYo2/h5FRaunw4V2gi44iTVOac.', 'admin'),
        ('Astra', 'astrastone19@gmail.com', '$2a$10$DBrwXaodZ8I3t58Iwb4WaOuMeSNfq8h2P9IHssteH7O3ltJ1Ah.IW', 'user');

      INSERT INTO Articles (title, content, category, createdAt)
      VALUES
        ('5 Tips for Better Sleep', 'Content about sleep...', 'Wellness', GETDATE()),
        ('Mindfulness for Beginners', 'Content about mindfulness...', 'Mental Health', GETDATE())
    `);
  } catch (error) {
    console.error("Setup error:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await pool.request().query(`
      DELETE FROM Appointments;
      DELETE FROM Journals;
      DELETE FROM Articles;
      DELETE FROM Users;
    `);
    await pool.close();
  } catch (error) {
    console.error("Teardown error:", error);
  }
});
