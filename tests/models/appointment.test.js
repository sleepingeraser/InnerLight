const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Appointment = require("../../models/appointment");

describe("Appointment Model", () => {
  let testUserId;
  const testEmail = `appt-${Date.now()}@example.com`;

  beforeAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Appointments");

    const user = await User.create({
      username: "apptuser",
      email: testEmail,
      password: "testpassword",
      role: "user",
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Appointments");
    await pool
      .request()
      .input("email", sql.NVarChar(255), testEmail)
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("create()", () => {
    it("should create a new appointment", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });

      expect(appointment).toHaveProperty("id");
      expect(appointment.status).toBe("pending");
    });
  });

  describe("findByUserId()", () => {
    it("should find appointments by user ID", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });

      const appointments = await Appointment.findByUserId(testUserId);
      expect(appointments.length).toBe(1);
      expect(appointments[0].userId).toBe(testUserId);
    });
  });
});
