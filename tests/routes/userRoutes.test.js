const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("User Routes", () => {
  beforeAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "test@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("POST /api/users/register", () => {
    it("should return 201 for valid registration", async () => {
      await request(app)
        .post("/api/users/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "testpassword",
        })
        .expect(201);
    });
  });

  describe("POST /api/users/login", () => {
    it("should return 200 for valid login", async () => {
      await request(app)
        .post("/api/users/login")
        .send({
          email: "test@example.com",
          password: "testpassword",
        })
        .expect(200);
    });
  });
});
