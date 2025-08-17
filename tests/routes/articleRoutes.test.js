const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const Article = require("../../models/article");

describe("Article Routes", () => {
  beforeAll(async () => {
    await Article.create({
      title: "Test Article",
      content: "Test content",
      category: "Test",
    });
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Articles");
    await pool.close();
  });

  describe("GET /api/articles", () => {
    it("should return 200 with articles array", async () => {
      await request(app).get("/api/articles").expect(200);
    });
  });
});
