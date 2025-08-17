const Article = require("../../models/article");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Article Model", () => {
  let testArticleId;

  afterEach(async () => {
    if (testArticleId) {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, testArticleId)
        .query("DELETE FROM Articles WHERE id = @id");
    }
  });

  describe("create()", () => {
    it("should create a new article", async () => {
      const article = await Article.create({
        title: "Test Article",
        content: "This is a test article content",
        category: "Wellness",
      });

      testArticleId = article.id;
      expect(article).toHaveProperty("id");
      expect(article.category).toBe("Wellness");
    });
  });

  describe("findAll()", () => {
    it("should retrieve all articles", async () => {
      const article1 = await Article.create({
        title: "Article 1",
        content: "Content 1",
        category: "Mental Health",
      });
      const article2 = await Article.create({
        title: "Article 2",
        content: "Content 2",
        category: "Wellness",
      });
      testArticleId = article2.id; // Only track one for cleanup

      const articles = await Article.findAll();
      expect(articles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("findByCategory()", () => {
    it("should filter articles by category", async () => {
      const article = await Article.create({
        title: "Category Test",
        content: "Category specific content",
        category: "Wellness",
      });
      testArticleId = article.id;

      const wellnessArticles = await Article.findByCategory("Wellness");
      expect(wellnessArticles.length).toBeGreaterThan(0);
      expect(wellnessArticles[0].category).toBe("Wellness");
    });
  });

  describe("findAllPaginated()", () => {
    it("should return paginated results", async () => {
      // Create multiple articles for pagination test
      for (let i = 0; i < 5; i++) {
        const article = await Article.create({
          title: `Pagination Article ${i}`,
          content: `Content ${i}`,
          category: i % 2 === 0 ? "Wellness" : "Mental Health",
        });
        if (i === 0) testArticleId = article.id;
      }

      const result = await Article.findAllPaginated({
        page: 1,
        limit: 2,
        sortBy: "createdAt",
        sortOrder: "DESC",
      });

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBeGreaterThanOrEqual(5);
      expect(result.pagination.page).toBe(1);
    });

    it("should filter by category when provided", async () => {
      const result = await Article.findAllPaginated({
        page: 1,
        limit: 10,
        category: "Wellness",
      });

      expect(result.data.every((a) => a.category === "Wellness")).toBe(true);
    });
  });
});
