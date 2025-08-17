const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Appointment = require("../../models/appointment");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Appointment Routes", () => {
  let testUser;
  let authToken;
  let testAppointmentId;

  beforeAll(async () => {
    testUser = await User.create({
      username: "apptroutes",
      email: "apptroutes@example.com",
      password: "password123",
      role: "user",
    });

    const response = await request(app).post("/api/users/login").send({
      email: "apptroutes@example.com",
      password: "password123",
    });
    authToken = response.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "apptroutes@example.com")
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

  describe("Authentication Requirements", () => {
    it("should reject unauthenticated POST /api/appointments (401)", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await request(app)
        .post("/api/appointments")
        .send({
          scheduledAt: futureDate.toISOString(),
        })
        .expect(401);
    });

    it("should reject unauthenticated GET /api/appointments (401)", async () => {
      await request(app).get("/api/appointments").expect(401);
    });
  });

  describe("Admin-Only Routes", () => {
    let adminToken;

    beforeAll(async () => {
      const adminUser = await User.create({
        username: "apptroutesadmin",
        email: "apptroutesadmin@example.com",
        password: "password123",
        role: "admin",
      });

      const response = await request(app).post("/api/users/login").send({
        email: "apptroutesadmin@example.com",
        password: "password123",
      });
      adminToken = response.body.token;

      // create test appointment
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const appointment = await Appointment.create({
        userId: testUser.id,
        scheduledAt: futureDate,
        status: "pending",
      });
      testAppointmentId = appointment.id;
    });

    afterAll(async () => {
      const pool = await poolPromise;
      await pool
        .request()
        .input("email", sql.NVarChar(255), "apptroutesadmin@example.com")
        .query("DELETE FROM Users WHERE email = @email");
    });

    it("should reject non-admin PUT /api/appointments/admin/:id/status (403)", async () => {
      await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "approved",
        })
        .expect(403);
    });

    it("should allow admin PUT /api/appointments/admin/:id/status (200)", async () => {
      await request(app)
        .put(`/api/appointments/admin/${testAppointmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "approved",
        })
        .expect(200);
    });
  });
});
