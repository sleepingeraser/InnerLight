const { poolPromise, sql } = require("../../config/dbConfig");
const Article = require("../../models/article");

describe("Article Model", () => {
  afterEach(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Articles");
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.close();
  });

  describe("create()", () => {
    it("should create a new article", async () => {
      const article = await Article.create({
        title: "Test Article",
        content: "Test content",
        category: "Test",
      });

      expect(article).toHaveProperty("id");
      expect(article.title).toBe("Test Article");
    });
  });

  describe("findAll()", () => {
    it("should find all articles", async () => {
      await Article.create({
        title: "Article 1",
        content: "Content 1",
        category: "Category 1",
      });

      await Article.create({
        title: "Article 2",
        content: "Content 2",
        category: "Category 2",
      });

      const articles = await Article.findAll();
      expect(articles.length).toBe(2);
    });
  });

  describe("findByCategory()", () => {
    it("should find articles by category", async () => {
      await Article.create({
        title: "Article 1",
        content: "Content 1",
        category: "Category 1",
      });

      await Article.create({
        title: "Article 2",
        content: "Content 2",
        category: "Category 2",
      });

      const articles = await Article.findByCategory("Category 1");
      expect(articles.length).toBe(1);
      expect(articles[0].category).toBe("Category 1");
    });
  });
});
