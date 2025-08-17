const request = require("supertest");
const app = require("../../app");
const { pool } = require("../../config/dbConfig");
const Article = require("../../models/article");

describe("Article Controller", () => {
  let authToken;
  let adminToken;
  let testArticleId;

  beforeAll(async () => {
    // login as regular user
    const userRes = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "Test1234!",
    });
    authToken = userRes.body.token;

    // login as admin
    const adminRes = await request(app).post("/api/users/login").send({
      email: "koyukisky18@gmail.com",
      password: "realme",
    });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testArticleId) {
      await pool.query("DELETE FROM Articles WHERE id = $1", [testArticleId]);
    }
    await pool.end();
  });

  describe("GET /articles", () => {
    it("should get all articles", async () => {
      const res = await request(app).get("/api/articles");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe("POST /articles", () => {
    it("should create a new article (admin only)", async () => {
      const res = await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Article",
          content: "Test content",
          category: "Test",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual("Test Article");

      testArticleId = res.body.id;
    });

    it("should return 403 for non-admin users", async () => {
      const res = await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Article",
          content: "Test content",
          category: "Test",
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe("PUT /articles/:id", () => {
    it("should update an article (admin only)", async () => {
      const res = await request(app)
        .put(`/api/articles/${testArticleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Updated Title",
          content: "Updated content",
          category: "Updated",
        });

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("DELETE /articles/:id", () => {
    it("should delete an article (admin only)", async () => {
      const res = await request(app)
        .delete(`/api/articles/${testArticleId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Article deleted successfully");

      testArticleId = null;
    });
  });
});
