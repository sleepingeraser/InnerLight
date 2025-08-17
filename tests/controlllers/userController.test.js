const { poolPromise, sql } = require("../../config/dbConfig");
const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");

describe("User Controller", () => {
  let authToken;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), testEmail)
      .query("DELETE FROM Users WHERE email = @email");
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), testEmail)
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: "testuser",
          email: testEmail,
          password: "testpassword",
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("token");
    });

    it("should reject duplicate email", async () => {
      await request(app)
        .post("/api/users/register")
        .send({
          username: "testuser",
          email: testEmail,
          password: "testpassword",
        })
        .expect(400);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: testEmail,
          password: "testpassword",
        })
        .expect(200);

      expect(res.body).toHaveProperty("token");
      authToken = res.body.token;
    });

    it("should reject invalid credentials", async () => {
      await request(app)
        .post("/api/users/login")
        .send({
          email: testEmail,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("GET /api/users/me", () => {
    it("should get current user with valid token", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testEmail);
    });

    it("should reject without token", async () => {
      await request(app).get("/api/users/me").expect(401);
    });
  });
});
