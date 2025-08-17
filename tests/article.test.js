const request = require("supertest");
const app = require("../app");

jest.setTimeout(15000);

describe("Article Operations", () => {
  let adminToken;
  let articleId;

  beforeAll(async () => {
    // login as admin
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "koyukisky18@gmail.com", password: "realme" });
    adminToken = res.body.token;
  });

  test("Get all articles", async () => {
    const res = await request(app).get("/api/articles");
    console.log("Articles response:", res.body);

    expect(res.statusCode).toEqual(200);
    // Handle both array and paginated responses
    const articles = res.body.data || res.body;
    expect(Array.isArray(articles)).toBeTruthy();
  });

  test("Admin can create article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Article",
        content: "Test content",
        category: "Test",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    articleId = res.body.id;
  });

  test("Admin can create article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Article",
        content: "Test content",
        category: "Test",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    articleId = res.body.id;
  });

  test("Get articles by category", async () => {
    const res = await request(app).get("/api/articles/category/Test");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test("Update article", async () => {
    const res = await request(app)
      .put(`/api/articles/${articleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Updated Article",
        content: "Updated content",
        category: "Updated",
      });

    expect(res.statusCode).toEqual(200);
  });

  test("Delete article", async () => {
    const res = await request(app)
      .delete(`/api/articles/${articleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
  });
});
