const request = require("supertest");
const app = require("../../app");
const { pool } = require("../../config/dbConfig");

describe("User Routes", () => {
  afterAll(async () => {
    await pool.end();
  });

  describe("POST /register", () => {
    it("should respond with JSON", async () => {
      const res = await request(app).post("/api/users/register").send({
        username: "routeuser",
        email: "routeuser@example.com",
        password: "Route1234!",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.type).toEqual("application/json");
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("token");

      // clean up
      await pool.query("DELETE FROM Users WHERE email = $1", [
        "routeuser@example.com",
      ]);
    });
  });

  describe("POST /login", () => {
    it("should respond with token for valid credentials", async () => {
      // first register a test user
      await request(app).post("/api/users/register").send({
        username: "loginuser",
        email: "loginuser@example.com",
        password: "Login1234!",
      });

      const res = await request(app).post("/api/users/login").send({
        email: "loginuser@example.com",
        password: "Login1234!",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");

      // clean up
      await pool.query("DELETE FROM Users WHERE email = $1", [
        "loginuser@example.com",
      ]);
    });
  });

  describe("GET /me", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.statusCode).toEqual(401);
    });
  });
});
