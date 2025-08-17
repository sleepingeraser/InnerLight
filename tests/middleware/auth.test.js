const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");

describe("Auth Middleware", () => {
  let testToken;

  beforeAll(async () => {
    const user = await User.create({
      username: "authuser",
      email: "auth@example.com",
      password: "testpassword",
      role: "user",
    });

    const res = await request(app).post("/api/users/login").send({
      email: "auth@example.com",
      password: "testpassword",
    });
    testToken = res.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "auth@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  it("should allow access with valid token", async () => {
    await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${testToken}`)
      .expect(200);
  });

  it("should reject access with invalid token", async () => {
    await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer invalidtoken")
      .expect(401);
  });

  it("should reject access without token", async () => {
    await request(app).get("/api/users/me").expect(401);
  });
});
