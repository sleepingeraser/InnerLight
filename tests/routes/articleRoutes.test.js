const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Article = require("../../models/article");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Article Routes", () => {
  let adminUser;
  let adminToken;
  let testArticleId;

  beforeAll(async () => {
    adminUser = await User.create({
      username: "articleroutesadmin",
      email: "articleroutes@example.com",
      password: "password123",
      role: "admin",
    });

    const response = await request(app).post("/api/users/login").send({
      email: "articleroutes@example.com",
      password: "password123",
    });
    adminToken = response.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "articleroutes@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  afterEach(async () => {
    if (testArticleId) {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, testArticleId)
        .query("DELETE FROM Articles WHERE id = @id");
    }
  });

  describe("Public Routes", () => {
    it("should allow access to GET /api/articles without auth (200)", async () => {
      const article = await Article.create({
        title: "Public Article",
        content: "Visible to all",
        category: "Wellness",
      });
      testArticleId = article.id;

      await request(app).get("/api/articles").expect(200);
    });

    it("should allow access to GET /api/articles/:id without auth (200)", async () => {
      const article = await Article.create({
        title: "Specific Article",
        content: "Visible when requested directly",
        category: "Mental Health",
      });
      testArticleId = article.id;

      await request(app).get(`/api/articles/${testArticleId}`).expect(200);
    });
  });

  describe("Admin-Only Routes", () => {
    it("should reject non-admin access to POST /api/articles (403)", async () => {
      const regularUser = await User.create({
        username: "articleroutesuser",
        email: "articleuser@example.com",
        password: "password123",
        role: "user",
      });
      const userRes = await request(app).post("/api/users/login").send({
        email: "articleuser@example.com",
        password: "password123",
      });

      await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${userRes.body.token}`)
        .send({
          title: "Unauthorized Create",
          content: "Should be rejected",
          category: "Wellness",
        })
        .expect(403);

      // cleanup
      const pool = await poolPromise;
      await pool
        .request()
        .input("email", sql.NVarChar(255), "articleuser@example.com")
        .query("DELETE FROM Users WHERE email = @email");
    });
  });
});
