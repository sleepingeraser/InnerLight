const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Journal = require("../../models/journal");

describe("Journal Controller", () => {
  let authToken;
  let testJournalId;

  beforeAll(async () => {
    // create test user and journal
    const user = await User.create({
      username: "journaluser",
      email: "journal@example.com",
      password: "testpassword",
      role: "user",
    });

    const loginRes = await request(app).post("/api/users/login").send({
      email: "journal@example.com",
      password: "testpassword",
    });
    authToken = loginRes.body.token;

    const journal = await Journal.create({
      userId: user.id,
      title: "Test Journal",
      content: "Test content",
    });
    testJournalId = journal.id;
  });

  afterAll(async () => {
    // clean up
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Journals");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "journal@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  describe("POST /api/journals", () => {
    it("should create a new journal entry", async () => {
      const res = await request(app)
        .post("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Journal",
          content: "New content",
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.content).toBe("New content");
    });
  });

  describe("GET /api/journals", () => {
    it("should get user journals", async () => {
      const res = await request(app)
        .get("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/journals/:id", () => {
    it("should get a specific journal", async () => {
      const res = await request(app)
        .get(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(testJournalId);
    });

    it("should reject access to other users journals", async () => {
      // create another user
      const otherUser = await User.create({
        username: "otheruser",
        email: "other@example.com",
        password: "testpassword",
        role: "user",
      });

      const otherJournal = await Journal.create({
        userId: otherUser.id,
        title: "Other Journal",
        content: "Other content",
      });

      await request(app)
        .get(`/api/journals/${otherJournal.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
