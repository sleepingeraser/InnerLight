const { pool } = require("../../config/dbConfig");
const Article = require("../../models/article");

describe("Article Model", () => {
  let testArticleId;

  beforeAll(async () => {
    // clean up any existing test data
    await pool.query("DELETE FROM Articles WHERE title LIKE 'Test%'");
  });

  afterAll(async () => {
    // clean up test data
    if (testArticleId) {
      await pool.query("DELETE FROM Articles WHERE id = $1", [testArticleId]);
    }
    await pool.end();
  });

  describe("create()", () => {
    it("should create a new article", async () => {
      const article = await Article.create({
        title: "Test Article",
        content: "Test content",
        category: "Test",
      });
      testArticleId = article.id;

      expect(article).toHaveProperty("id");
      expect(article.title).toEqual("Test Article");
      expect(article.category).toEqual("Test");
    });
  });

  describe("findAll()", () => {
    it("should find all articles", async () => {
      const articles = await Article.findAll();

      expect(Array.isArray(articles)).toBeTruthy();
    });
  });

  describe("findByCategory()", () => {
    it("should find articles by category", async () => {
      const articles = await Article.findByCategory("Test");

      expect(Array.isArray(articles)).toBeTruthy();
      if (articles.length > 0) {
        expect(articles[0].category).toEqual("Test");
      }
    });
  });

  describe("findById()", () => {
    it("should find an article by ID", async () => {
      if (!testArticleId) return; // skip if no article was created

      const article = await Article.findById(testArticleId);

      expect(article).not.toBeNull();
      expect(article.id).toEqual(testArticleId);
    });
  });

  describe("update()", () => {
    it("should update an article", async () => {
      if (!testArticleId) return; // skip if no article was created

      const updated = await Article.update(testArticleId, {
        title: "Updated Title",
        content: "Updated content",
        category: "Updated",
      });
      expect(updated).toBeTruthy();

      const article = await Article.findById(testArticleId);
      expect(article.title).toEqual("Updated Title");
    });
  });

  describe("delete()", () => {
    it("should delete an article", async () => {
      if (!testArticleId) return; // skip if no article was created

      const deleted = await Article.delete(testArticleId);
      expect(deleted).toBeTruthy();

      const article = await Article.findById(testArticleId);
      expect(article).toBeUndefined();

      testArticleId = null;
    });
  });
});
