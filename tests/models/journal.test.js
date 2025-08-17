const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Journal = require("../../models/journal");

describe("Journal Model", () => {
  let testUserId;

  beforeAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Journals");

    const user = await User.create({
      username: "journaluser",
      email: "journal@example.com",
      password: "testpassword",
      role: "user",
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Journals");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "journal@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("findByUserId()", () => {
    it("should find journals by user ID", async () => {
      // create exactly two journals
      await Journal.create({
        userId: testUserId,
        title: "Journal 1",
        content: "Content 1",
      });
      await Journal.create({
        userId: testUserId,
        title: "Journal 2",
        content: "Content 2",
      });

      const journals = await Journal.findByUserId(testUserId);
      expect(journals.length).toBe(2);
    });
  });
});
