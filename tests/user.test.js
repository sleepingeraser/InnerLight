const request = require("supertest");
const app = require("../app");
jest.setTimeout(15000);

describe("User Authentication", () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // login to get tokens
    const userRes = await request(app)
      .post("/api/users/login")
      .send({ email: "astrastone19@gmail.com", password: "pokemon" });
    userToken = userRes.body.token;

    const adminRes = await request(app)
      .post("/api/users/login")
      .send({ email: "koyukisky18@gmail.com", password: "realme" });
    adminToken = adminRes.body.token;
  });

  test("Register new user with unique credentials", async () => {
    const uniqueEmail = `test-${Date.now()}@test.com`;
    const res = await request(app)
      .post("/api/users/register")
      .send({
        username: `testuser-${Date.now()}`,
        email: uniqueEmail,
        password: "TestPassword123",
      });

    console.log("Registration response:", res.status, res.body);
    expect(res.statusCode).toEqual(201);
  }, 10000);

  test("Login existing user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "astrastone19@gmail.com", password: "pokemon" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Get current user profile", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("email", "astrastone19@gmail.com");
  });

  test("Admin can get all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Non-admin cannot get all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
