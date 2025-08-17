const { pool } = require("../../config/dbConfig");
const Appointment = require("../../models/appointment");

describe("Appointment Model", () => {
  let testAppointmentId;
  const testUserId = 1; // assuming this user exists in your test DB
  const futureDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow

  beforeAll(async () => {
    // clean up any existing test data
    await pool.query("DELETE FROM Appointments WHERE userId = $1", [
      testUserId,
    ]);
  });

  afterAll(async () => {
    // clean up test data
    if (testAppointmentId) {
      await pool.query("DELETE FROM Appointments WHERE id = $1", [
        testAppointmentId,
      ]);
    }
    await pool.end();
  });

  describe("create()", () => {
    it("should create a new appointment with pending status", async () => {
      const appointment = await Appointment.create({
        userId: testUserId,
        scheduledAt: futureDate,
      });
      testAppointmentId = appointment.id;

      expect(appointment).toHaveProperty("id");
      expect(appointment.userId).toEqual(testUserId);
      expect(appointment.status).toEqual("pending");
    });
  });

  describe("findByUserId()", () => {
    it("should find appointments by user ID", async () => {
      const appointments = await Appointment.findByUserId(testUserId);

      expect(Array.isArray(appointments)).toBeTruthy();
      if (appointments.length > 0) {
        expect(appointments[0].userId).toEqual(testUserId);
      }
    });
  });

  describe("findByUserIdAndStatus()", () => {
    it("should find appointments by user ID and status", async () => {
      const appointments = await Appointment.findByUserIdAndStatus(
        testUserId,
        "pending"
      );

      expect(Array.isArray(appointments)).toBeTruthy();
      if (appointments.length > 0) {
        expect(appointments[0].userId).toEqual(testUserId);
        expect(appointments[0].status).toEqual("pending");
      }
    });
  });

  describe("findById()", () => {
    it("should find an appointment by ID", async () => {
      if (!testAppointmentId) return; // skip if no appointment was created

      const appointment = await Appointment.findById(testAppointmentId);

      expect(appointment).not.toBeNull();
      expect(appointment.id).toEqual(testAppointmentId);
    });
  });

  describe("updateStatus()", () => {
    it("should update appointment status", async () => {
      if (!testAppointmentId) return; // skip if no appointment was created

      const updated = await Appointment.updateStatus(
        testAppointmentId,
        "approved"
      );
      expect(updated).toBeTruthy();

      const appointment = await Appointment.findById(testAppointmentId);
      expect(appointment.status).toEqual("approved");
    });
  });

  describe("delete()", () => {
    it("should delete an appointment", async () => {
      if (!testAppointmentId) return; // skip if no appointment was created

      const deleted = await Appointment.delete(testAppointmentId);
      expect(deleted).toBeTruthy();

      const appointment = await Appointment.findById(testAppointmentId);
      expect(appointment).toBeUndefined();

      testAppointmentId = null;
    });
  });
});
