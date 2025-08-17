const Journal = require("../../models/journal");
const User = require("../../models/user");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("Journal Model", () => {
  let testUserId;
  let testJournalId;

  beforeAll(async () => {
    // create a test user
    const user = await User.create({
      username: "journaluser",
      email: "journal@example.com",
      password: "password123",
      role: "user",
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, testUserId)
      .query("DELETE FROM Users WHERE id = @id");
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

  describe("create()", () => {
    it("should create a new journal entry", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "Test Journal",
        content: "This is a test journal entry",
      });

      testJournalId = journal.id;
      expect(journal).toHaveProperty("id");
      expect(journal.title).toBe("Test Journal");
    });
  });

  describe("findByUserId()", () => {
    it("should find journals by user ID", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "Find Journals Test",
        content: "Content for finding journals",
      });
      testJournalId = journal.id;

      const journals = await Journal.findByUserId(testUserId);
      expect(journals.length).toBeGreaterThan(0);
      expect(journals[0].userId).toBe(testUserId);
    });
  });

  describe("update()", () => {
    it("should update a journal entry", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "Original Title",
        content: "Original Content",
      });
      testJournalId = journal.id;

      const updated = await Journal.update(testJournalId, {
        title: "Updated Title",
        content: "Updated Content",
      });
      expect(updated).toBe(true);

      const updatedJournal = await Journal.findById(testJournalId);
      expect(updatedJournal.title).toBe("Updated Title");
    });
  });

  describe("delete()", () => {
    it("should delete a journal entry", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "To be deleted",
        content: "This will be deleted",
      });
      testJournalId = journal.id;

      const deleted = await Journal.delete(testJournalId);
      expect(deleted).toBe(true);

      const journalAfterDelete = await Journal.findById(testJournalId);
      expect(journalAfterDelete).toBeUndefined();
      testJournalId = null; // prevent afterEach from trying to delete again
    });
  });
});
