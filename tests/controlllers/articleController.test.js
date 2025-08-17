const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Article = require("../../models/article");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Article Controller", () => {
  let adminUser;
  let adminToken;
  let regularUser;
  let regularToken;
  let testArticleId;

  beforeAll(async () => {
    // create admin user
    adminUser = await User.create({
      username: "articletestadmin",
      email: "articleadmin@example.com",
      password: "password123",
      role: "admin",
    });
    const adminRes = await request(app).post("/api/users/login").send({
      email: "articleadmin@example.com",
      password: "password123",
    });
    adminToken = adminRes.body.token;

    // create regular user
    regularUser = await User.create({
      username: "articletestuser",
      email: "articleuser@example.com",
      password: "password123",
      role: "user",
    });
    const userRes = await request(app).post("/api/users/login").send({
      email: "articleuser@example.com",
      password: "password123",
    });
    regularToken = userRes.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "articleadmin@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "articleuser@example.com")
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

  describe("POST /api/articles", () => {
    it("should create article as admin (201)", async () => {
      const response = await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin Created Article",
          content: "Content from admin",
          category: "Wellness",
        })
        .expect(201);

      testArticleId = response.body.id;
      expect(response.body.title).toBe("Admin Created Article");
    });

    it("should reject as regular user (403)", async () => {
      await request(app)
        .post("/api/articles")
        .set("Authorization", `Bearer ${regularToken}`)
        .send({
          title: "User Created Article",
          content: "Should be rejected",
          category: "Wellness",
        })
        .expect(403);
    });
  });

  describe("GET /api/articles", () => {
    it("should retrieve articles (200)", async () => {
      const article = await Article.create({
        title: "Public Article",
        content: "Should be visible to all",
        category: "Mental Health",
      });
      testArticleId = article.id;

      const response = await request(app).get("/api/articles").expect(200);

      expect(response.body.data || response.body).toContainEqual(
        expect.objectContaining({
          id: testArticleId,
          title: "Public Article",
        })
      );
    });

    it("should filter by category (200)", async () => {
      const response = await request(app)
        .get("/api/articles?category=Mental+Health")
        .expect(200);

      if (response.body.data) {
        // if using pagination
        expect(
          response.body.data.every((a) => a.category === "Mental Health")
        ).toBe(true);
      } else {
        expect(response.body.every((a) => a.category === "Mental Health")).toBe(
          true
        );
      }
    });
  });

  describe("DELETE /api/articles/:id", () => {
    it("should delete as admin (200)", async () => {
      const article = await Article.create({
        title: "To be deleted",
        content: "Will be deleted by admin",
        category: "Wellness",
      });
      testArticleId = article.id;

      await request(app)
        .delete(`/api/articles/${testArticleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const articleAfterDelete = await Article.findById(testArticleId);
      expect(articleAfterDelete).toBeUndefined();
      testArticleId = null;
    });

    it("should reject as regular user (403)", async () => {
      const article = await Article.create({
        title: "Protected Article",
        content: "Should not be deletable",
        category: "Wellness",
      });
      testArticleId = article.id;

      await request(app)
        .delete(`/api/articles/${testArticleId}`)
        .set("Authorization", `Bearer ${regularToken}`)
        .expect(403);
    });
  });
});
