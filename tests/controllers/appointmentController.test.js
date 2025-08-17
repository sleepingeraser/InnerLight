const request = require("supertest");
const app = require("../../app");
const { pool } = require("../../config/dbConfig");
const Appointment = require("../../models/appointment");

describe("Appointment Controller", () => {
  let authToken;
  let adminToken;
  let testAppointmentId;
  const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow

  beforeAll(async () => {
    // login as regular user
    const userRes = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "Test1234!",
    });
    authToken = userRes.body.token;

    // login as admin
    const adminRes = await request(app).post("/api/users/login").send({
      email: "koyukisky18@gmail.com",
      password: "realme",
    });
    adminToken = adminRes.body.token;
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

  describe("POST /appointments", () => {
    it("should create a new appointment", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          scheduledAt: futureDate,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual("pending");

      testAppointmentId = res.body.id;
    });

    it("should return 400 for past date", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          scheduledAt: pastDate,
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe("GET /appointments", () => {
    it("should get user appointments", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe("GET /appointments/admin/all", () => {
    it("should get all appointments (admin only)", async () => {
      const res = await request(app)
        .get("/api/appointments/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe("PUT /appointments/admin/:id/status", () => {
    it("should update appointment status (admin only)", async () => {
      const res = await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "approved",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.appointment.status).toEqual("approved");
    });
  });

  describe("DELETE /appointments/:id", () => {
    it("should delete an appointment", async () => {
      const res = await request(app)
        .delete(`/api/appointments/${testAppointmentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Appointment deleted successfully");

      testAppointmentId = null;
    });
  });
});
