const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Article = require("../../models/article");

describe("Article Controller", () => {
  let adminToken;
  let testArticleId;

  beforeAll(async () => {
    // create admin user
    const admin = await User.create({
      username: "articleadmin",
      email: "admin@example.com",
      password: "testpassword",
      role: "admin",
    });

    const loginRes = await request(app).post("/api/users/login").send({
      email: "admin@example.com",
      password: "testpassword",
    });
    adminToken = loginRes.body.token;

    // create test article
    const article = await Article.create({
      title: "Test Article",
      content: "Test content",
      category: "Test",
    });
    testArticleId = article.id;
  });

  afterAll(async () => {
    // clean up
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Articles");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "admin@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  describe("GET /api/articles", () => {
    it("should get all articles", async () => {
      const res = await request(app).get("/api/articles").expect(200);

      expect(Array.isArray(res.body.data || res.body)).toBe(true);
    });
  });

  describe("POST /api/articles", () => {
    it("should create article as admin", async () => {
      const res = await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "New Article",
          content: "New content",
          category: "New",
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
    });

    it("should reject as regular user", async () => {
      const user = await User.create({
        username: "regularuser",
        email: "user@example.com",
        password: "testpassword",
        role: "user",
      });

      const loginRes = await request(app).post("/api/users/login").send({
        email: "user@example.com",
        password: "testpassword",
      });

      await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${loginRes.body.token}`)
        .send({
          title: "User Article",
          content: "User content",
          category: "User",
        })
        .expect(403);
    });
  });
});
