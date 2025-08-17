const request = require("supertest");
const app = require("../../app");
const { pool } = require("../../config/dbConfig");
const User = require("../../models/user");

describe("User Controller", () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // create a test user
    testUser = {
      username: "testuser",
      email: "test@example.com",
      password: "Test1234!",
    };

    // register the test user
    await request(app).post("/api/users/register").send(testUser);

    // login to get token
    const loginRes = await request(app).post("/api/users/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    // clean up test data
    await pool.query("DELETE FROM Users WHERE email = $1", [testUser.email]);
    await pool.end();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const newUser = {
        username: "newuser",
        email: "new@example.com",
        password: "New1234!",
      };

      const res = await request(app).post("/api/users/register").send(newUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 for duplicate email", async () => {
      const res = await request(app).post("/api/users/register").send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("User already exists");
    });
  });

  describe("POST /login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 401 for invalid credentials", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual("Invalid credentials");
    });
  });

  describe("GET /me", () => {
    it("should get current user profile", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual(testUser.email);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.statusCode).toEqual(401);
    });
  });
});
