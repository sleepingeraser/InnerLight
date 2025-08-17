const request = require("supertest");
const app = require("../../app");
const { pool } = require("../../config/dbConfig");
const Journal = require("../../models/journal");

describe("Journal Controller", () => {
  let authToken;
  let testJournalId;

  beforeAll(async () => {
    // login to get token
    const loginRes = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "Test1234!",
    });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    // clean up test data
    if (testJournalId) {
      await pool.query("DELETE FROM Journals WHERE id = $1", [testJournalId]);
    }
    await pool.end();
  });

  describe("POST /journals", () => {
    it("should create a new journal entry", async () => {
      const res = await request(app)
        .post("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Journal",
          content: "This is a test journal entry",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.content).toEqual("This is a test journal entry");

      testJournalId = res.body.id;
    });
  });

  describe("GET /journals", () => {
    it("should get all journals for the user", async () => {
      const res = await request(app)
        .get("/api/journals")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe("GET /journals/:id", () => {
    it("should get a specific journal entry", async () => {
      const res = await request(app)
        .get(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(testJournalId);
    });

    it("should return 404 for non-existent journal", async () => {
      const res = await request(app)
        .get("/api/journals/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe("PUT /journals/:id", () => {
    it("should update a journal entry", async () => {
      const res = await request(app)
        .put(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Journal updated successfully");
    });
  });

  describe("DELETE /journals/:id", () => {
    it("should delete a journal entry", async () => {
      const res = await request(app)
        .delete(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Journal deleted successfully");

      testJournalId = null;
    });
  });
});
