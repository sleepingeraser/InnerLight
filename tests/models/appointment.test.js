const Appointment = require("../../models/appointment");
const User = require("../../models/user");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Appointment Model", () => {
  jest.setTimeout(10000);
  let testUserId;
  let testAppointmentId;

  beforeAll(async () => {
    // create a test user
    const user = await User.create({
      username: "apptuser",
      email: "appt@example.com",
      password: "password123",
      role: "user",
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, testUserId)
      .query("DELETE FROM Users WHERE id = @id");
  });

  afterEach(async () => {
    if (testAppointmentId) {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, testAppointmentId)
        .query("DELETE FROM Appointments WHERE id = @id");
    }
  });

  describe("create()", () => {
    it("should create a new appointment", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });

      testAppointmentId = appointment.id;
      expect(appointment).toHaveProperty("id");
      expect(appointment.status).toBe("pending");
    });
  });

  describe("findByUserId()", () => {
    it("should find appointments by user ID", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });
      testAppointmentId = appointment.id;

      const appointments = await Appointment.findByUserId(testUserId);
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].userId).toBe(testUserId);
    });
  });

  describe("updateStatus()", () => {
    it("should update appointment status", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });
      testAppointmentId = appointment.id;

      const updated = await Appointment.updateStatus(
        testAppointmentId,
        "approved"
      );
      expect(updated).toBe(true);

      const updatedAppointment = await Appointment.findById(testAppointmentId);
      expect(updatedAppointment.status).toBe("approved");
    });
  });
});
