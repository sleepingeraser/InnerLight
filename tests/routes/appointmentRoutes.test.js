const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");

describe("Appointment Routes", () => {
  let authToken;

  beforeAll(async () => {
    const user = await User.create({
      username: "apptuser",
      email: "appt@example.com",
      password: "testpassword",
      role: "user",
    });

    const res = await request(app).post("/api/users/login").send({
      email: "appt@example.com",
      password: "testpassword",
    });
    authToken = res.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Appointments");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "appt@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  describe("POST /api/appointments", () => {
    it("should return 201 for valid appointment", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          scheduledAt: futureDate.toISOString(),
        })
        .expect(201);
    });
  });
});
