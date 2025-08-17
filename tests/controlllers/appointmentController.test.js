const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Appointment = require("../../models/appointment");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Appointment Controller", () => {
  let testUser;
  let authToken;
  let adminUser;
  let adminToken;
  let testAppointmentId;

  beforeAll(async () => {
    // create regular user
    testUser = await User.create({
      username: "apptcontroller",
      email: "apptcontroller@example.com",
      password: "password123",
      role: "user",
    });

    const userRes = await request(app).post("/api/users/login").send({
      email: "apptcontroller@example.com",
      password: "password123",
    });
    authToken = userRes.body.token;

    // create admin user
    adminUser = await User.create({
      username: "apptadmincontroller",
      email: "apptadmincontroller@example.com",
      password: "password123",
      role: "admin",
    });

    const adminRes = await request(app).post("/api/users/login").send({
      email: "apptadmincontroller@example.com",
      password: "password123",
    });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "apptcontroller@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "apptadmincontroller@example.com")
      .query("DELETE FROM Users WHERE email = @email");
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

  describe("POST /api/appointments", () => {
    it("should create a new appointment (201)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          scheduledAt: futureDate.toISOString(),
        })
        .expect(201);

      testAppointmentId = response.body.id;
      expect(response.body.status).toBe("pending");
    });

    it("should reject past dates (400)", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          scheduledAt: pastDate.toISOString(),
        })
        .expect(400);
    });
  });

  describe("GET /api/appointments", () => {
    it("should retrieve user appointments (200)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUser.id,
        scheduledAt: futureDate,
        status: "pending",
      });
      testAppointmentId = appointment.id;

      const response = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.some((a) => a.id === testAppointmentId)).toBe(true);
    });

    it("should filter by status (200)", async () => {
      const response = await request(app)
        .get("/api/appointments?status=pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      if (response.body.length > 0) {
        expect(response.body.every((a) => a.status === "pending")).toBe(true);
      }
    });
  });

  describe("PUT /api/appointments/admin/:id/status", () => {
    it("should update status as admin (200)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUser.id,
        scheduledAt: futureDate,
        status: "pending",
      });
      testAppointmentId = appointment.id;

      await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "approved",
        })
        .expect(200);

      const updatedAppointment = await Appointment.findById(testAppointmentId);
      expect(updatedAppointment.status).toBe("approved");
    });

    it("should reject invalid status (400)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUser.id,
        scheduledAt: futureDate,
        status: "pending",
      });
      testAppointmentId = appointment.id;

      await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "invalid-status",
        })
        .expect(400);
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("should cancel appointment (200)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const appointment = await Appointment.create({
        userId: testUser.id,
        scheduledAt: futureDate,
        status: "pending",
      });
      testAppointmentId = appointment.id;

      await request(app)
        .delete(`/api/appointments/${testAppointmentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      const deletedAppointment = await Appointment.findById(testAppointmentId);
      expect(deletedAppointment).toBeUndefined();
      testAppointmentId = null;
    });
  });
});
