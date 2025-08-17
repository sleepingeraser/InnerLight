const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("User Routes", () => {
  let adminUser;
  let adminToken;
  let regularUser;
  let regularToken;

  beforeAll(async () => {
    // Create admin user
    adminUser = await User.create({
      username: "routeadmin",
      email: "adminroute@example.com",
      password: "password123",
      role: "admin",
    });
    const adminRes = await request(app).post("/api/users/login").send({
      email: "adminroute@example.com",
      password: "password123",
    });
    adminToken = adminRes.body.token;

    // Create regular user
    regularUser = await User.create({
      username: "routeuser",
      email: "userroute@example.com",
      password: "password123",
      role: "user",
    });
    const userRes = await request(app).post("/api/users/login").send({
      email: "userroute@example.com",
      password: "password123",
    });
    regularToken = userRes.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "adminroute@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "userroute@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("GET /api/users", () => {
    it("should allow access for admin (200)", async () => {
      await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("should reject access for regular user (403)", async () => {
      await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${regularToken}`)
        .expect(403);
    });

    it("should reject without token (401)", async () => {
      await request(app).get("/api/users").expect(401);
    });
  });
});
