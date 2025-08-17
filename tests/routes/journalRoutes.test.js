const request = require("supertest");
const app = require("../../app");
const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");
const Journal = require("../../models/journal");

describe("Journal Routes", () => {
  let authToken;

  beforeAll(async () => {
    const user = await User.create({
      username: "journaluser",
      email: "journal@example.com",
      password: "testpassword",
      role: "user",
    });

    const res = await request(app).post("/api/users/login").send({
      email: "journal@example.com",
      password: "testpassword",
    });
    authToken = res.body.token;

    await Journal.create({
      userId: user.id,
      title: "Test Journal",
      content: "Test content",
    });
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool.request().query("DELETE FROM Journals");
    await pool
      .request()
      .input("email", sql.NVarChar(255), "journal@example.com")
      .query("DELETE FROM Users WHERE email = @email");
    await pool.close();
  });

  describe("GET /api/journals", () => {
    it("should return 200 with journals array", async () => {
      await request(app)
        .get("/api/journals")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
