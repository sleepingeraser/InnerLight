const { poolPromise, sql } = require("../../config/dbConfig");
const User = require("../../models/user");

describe("User Model", () => {
  const testEmail = `test-${Date.now()}@example.com`;

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), testEmail)
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("create()", () => {
    it("should create a new user", async () => {
      const user = await User.create({
        username: "testuser",
        email: testEmail,
        password: "testpassword",
        role: "user",
      });

      expect(user).toHaveProperty("id");
      expect(user.email).toBe(testEmail);
      expect(user.password).not.toBe("testpassword");
    });
  });

  describe("findByEmail()", () => {
    it("should find user by email", async () => {
      const user = await User.findByEmail(testEmail);
      expect(user).not.toBeNull();
      expect(user.email).toBe(testEmail);
    });

    it("should return undefined for non-existent email", async () => {
      const user = await User.findByEmail("nonexistent@example.com");
      expect(user).toBeUndefined();
    });
  });
});
