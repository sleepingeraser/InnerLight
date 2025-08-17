const request = require("supertest");
const app = require("../../app");
const User = require("../../models/user");
const Journal = require("../../models/journal");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Journal Routes", () => {
  let testUser;
  let authToken;
  let testJournalId;

  beforeAll(async () => {
    testUser = await User.create({
      username: "journallroutes",
      email: "journalroutes@example.com",
      password: "password123",
      role: "user",
    });

    const response = await request(app).post("/api/users/login").send({
      email: "journalroutes@example.com",
      password: "password123",
    });
    authToken = response.body.token;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "journalroutes@example.com")
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

  describe("Protected Routes", () => {
    it("should reject unauthenticated access to POST /api/journals (401)", async () => {
      await request(app)
        .post("/api/journals")
        .send({
          title: "Unauthenticated",
          content: "Should be rejected",
        })
        .expect(401);
    });

    it("should reject unauthenticated access to GET /api/journals (401)", async () => {
      await request(app).get("/api/journals").expect(401);
    });
  });

  describe("PUT /api/journals/:id", () => {
    it("should update journal entry (200)", async () => {
      const journal = await Journal.create({
        userId: testUser.id,
        title: "Original Title",
        content: "Original Content",
      });
      testJournalId = journal.id;

      await request(app)
        .put(`/api/journals/${testJournalId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          content: "Updated Content",
        })
        .expect(200);
    });
  });
});
