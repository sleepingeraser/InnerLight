const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("User Controller", () => {
  let testUserId;
  let authToken;

  beforeAll(async () => {
    // create a test user
    const user = await User.create({
      username: "testcontroller",
      email: "controller@example.com",
      password: "password123",
      role: "user",
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "controller@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "newuser@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("POST /api/users/register", () => {
    it("should register a new user (201)", async () => {
      const response = await request(app)
        .post("/api/users/register")
        .send({
          username: "newuser",
          email: "newuser@example.com",
          password: "password123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe("newuser@example.com");
    });

    it("should reject duplicate email (400)", async () => {
      await request(app)
        .post("/api/users/register")
        .send({
          username: "testcontroller",
          email: "controller@example.com",
          password: "password123",
        })
        .expect(400);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login with valid credentials (200)", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "controller@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      authToken = response.body.token;
    });

    it("should reject invalid password (401)", async () => {
      await request(app)
        .post("/api/users/login")
        .send({
          email: "controller@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("GET /api/users/me", () => {
    it("should get current user with valid token (200)", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe("controller@example.com");
    });

    it("should reject without token (401)", async () => {
      await request(app).get("/api/users/me").expect(401);
    });
  });
});
