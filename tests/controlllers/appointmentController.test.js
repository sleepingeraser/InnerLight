const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Appointment = require("../../models/appointment");

describe("Appointment Controller", () => {
  let userToken;
  let adminToken;
  let testAppointmentId;

  beforeAll(async () => {
    // create test users
    const user = await User.create({
      username: "apptuser",
      email: "user@example.com",
      password: "testpassword",
      role: "user",
    });

    const admin = await User.create({
      username: "apptadmin",
      email: "admin@example.com",
      password: "testpassword",
      role: "admin",
    });

    // get tokens
    const userRes = await request(app).post("/api/users/login").send({
      email: "user@example.com",
      password: "testpassword",
    });
    userToken = userRes.body.token;

    const adminRes = await request(app).post("/api/users/login").send({
      email: "admin@example.com",
      password: "testpassword",
    });
    adminToken = adminRes.body.token;

    // create test appointment
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const appointment = await Appointment.create({
      userId: user.id,
      scheduledAt: futureDate,
    });
    testAppointmentId = appointment.id;
  });

  afterAll(async () => {
    // clean up
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Appointments");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "user@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "admin@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  describe("POST /api/appointments", () => {
    it("should create appointment with future date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          scheduledAt: futureDate.toISOString(),
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
    });

    it("should reject past date", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          scheduledAt: pastDate.toISOString(),
        })
        .expect(400);
    });
  });

  describe("PUT /api/appointments/admin/:id/status", () => {
    it("should update status as admin", async () => {
      const res = await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "approved",
        })
        .expect(200);

      expect(res.body.message).toBe("Appointment status updated successfully");
    });
  });
});
