const { pool } = require("../../config/dbConfig");
const Journal = require("../../models/journal");

describe("Journal Model", () => {
  let testJournalId;
  const testUserId = 1; // assuming this user exists in your test DB

  beforeAll(async () => {
    // clean up any existing test data
    await pool.query("DELETE FROM Journals WHERE userId = $1", [testUserId]);
  });

  afterAll(async () => {
    // clean up test data
    if (testJournalId) {
      await pool.query("DELETE FROM Journals WHERE id = $1", [testJournalId]);
    }
    await pool.end();
  });

  describe("create()", () => {
    it("should create a new journal entry", async () => {
      const journal = await Journal.create({
        userId: testUserId,
        title: "Test Journal",
        content: "Test content",
      });
      testJournalId = journal.id;

      expect(journal).toHaveProperty("id");
      expect(journal.userId).toEqual(testUserId);
      expect(journal.content).toEqual("Test content");
    });
  });

  describe("findByUserId()", () => {
    it("should find journals by user ID", async () => {
      const journals = await Journal.findByUserId(testUserId);

      expect(Array.isArray(journals)).toBeTruthy();
      if (journals.length > 0) {
        expect(journals[0].userId).toEqual(testUserId);
      }
    });
  });

  describe("findById()", () => {
    it("should find a journal by ID", async () => {
      if (!testJournalId) return; // skip if no journal was created

      const journal = await Journal.findById(testJournalId);

      expect(journal).not.toBeNull();
      expect(journal.id).toEqual(testJournalId);
    });
  });

  describe("update()", () => {
    it("should update a journal entry", async () => {
      if (!testJournalId) return; // skip if no journal was created

      const updated = await Journal.update(testJournalId, {
        title: "Updated Title",
        content: "Updated content",
      });
      expect(updated).toBeTruthy();

      const journal = await Journal.findById(testJournalId);
      expect(journal.title).toEqual("Updated Title");
    });
  });

  describe("delete()", () => {
    it("should delete a journal entry", async () => {
      if (!testJournalId) return; // skip if no journal was created

      const deleted = await Journal.delete(testJournalId);
      expect(deleted).toBeTruthy();

      const journal = await Journal.findById(testJournalId);
      expect(journal).toBeUndefined();

      testJournalId = null;
    });
  });
});
