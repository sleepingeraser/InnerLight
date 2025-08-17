const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Journal = require("../../models/journal");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Journal Controller", () => {
  let testUserId;
  let authToken;
  let testJournalId;

  beforeAll(async () => {
    // create test user and get token
    const user = await User.create({
      username: "journaltest",
      email: "journaltest@example.com",
      password: "password123",
      role: "user",
    });
    testUserId = user.id;

    const response = await request(app).post("/api/users/login").send({
      email: "journaltest@example.com",
      password: "password123",
    });
    authToken = response.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "journaltest@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  afterEach(async () => {
    if (testJournalId) {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, testJournalId)
        .query("DELETE FROM Journals WHERE id = @id");
    }
  });

  describe("POST /api/journals", () => {
    it("should create a new journal entry (201)", async () => {
      const response = await request(app)
        .post("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "API Test Journal",
          content: "This was created via API",
        })
        .expect(201);

      testJournalId = response.body.id;
      expect(response.body.title).toBe("API Test Journal");
    });

    it("should reject without content (400)", async () => {
      await request(app)
        .post("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Invalid Journal",
          content: "",
        })
        .expect(400);
    });
  });

  describe("GET /api/journals", () => {
    it("should retrieve user journals (200)", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "Retrieval Test",
        content: "Should be returned in GET",
      });
      testJournalId = journal.id;

      const response = await request(app)
        .get("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((j) => j.id === testJournalId)).toBe(true);
    });
  });

  describe("DELETE /api/journals/:id", () => {
    it("should delete a journal entry (200)", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "To be deleted",
        content: "This will be deleted via API",
      });
      testJournalId = journal.id;

      await request(app)
        .delete(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      const journalAfterDelete = await Journal.findById(testJournalId);
      expect(journalAfterDelete).toBeUndefined();
      testJournalId = null;
    });

    it("should reject deleting others journals (403)", async () => {
      const otherUser = await User.create({
        username: "otherjournaluser",
        email: "otherjournal@example.com",
        password: "password123",
        role: "user",
      });
      const otherJournal = await Journal.create({
        userId: otherUser.id,
        title: "Other User Journal",
        content: "Should not be deletable",
      });

      await request(app)
        .delete(`/api/journals/${otherJournal.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      // cleanup
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, otherJournal.id)
        .query("DELETE FROM Journals WHERE id = @id");
      await pool
        .request()
        .input("email", sql.NVarChar(255), "otherjournal@example.com")
        .query("DELETE FROM Users WHERE email = @email");
    });
  });
});
