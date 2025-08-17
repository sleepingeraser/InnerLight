const User = require("../../models/user");
const { poolPromise, sql } = require("../../config/dbConfig");

describe("User Model", () => {
  let testUserId;

  afterEach(async () => {
    if (testUserId) {
      const pool = await poolPromise;
      await pool
        .request()
        .input("id", sql.Int, testUserId)
        .query("DELETE FROM Users WHERE id = @id");
    }
  });

  describe("create()", () => {
    it("should create a new user", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      testUserId = user.id;
      expect(user).toHaveProperty("id");
      expect(user.email).toBe("test@example.com");
    });
  });

  describe("findByEmail()", () => {
    it("should find user by email", async () => {
      const user = await User.findByEmail(testEmail);
      expect(user).not.toBeNull();
      expect(user.email).toBe(testEmail);
    });

    it("should return undefined for non-existent email", async () => {
      const User = require("../../models/user");
      const { poolPromise } = require("../../config/dbConfig");

      describe("User Model", () => {
        let testUserId;

        afterEach(async () => {
          if (testUserId) {
            const pool = await poolPromise;
            await pool
              .request()
              .input("id", sql.Int, testUserId)
              .query("DELETE FROM Users WHERE id = @id");
          }
        });

        describe("create()", () => {
          it("should create a new user", async () => {
            const user = await User.create({
              username: "testuser",
              email: "test@example.com",
              password: "password123",
              role: "user",
            });

            testUserId = user.id;
            expect(user).toHaveProperty("id");
            expect(user.email).toBe("test@example.com");
          });
        });

        describe("create()", () => {
          it("should create a new user", async () => {
            const user = await User.create({
              username: "testuser",
              email: "test@example.com",
              password: "password123",
              role: "user",
            });
            testUserId = user.id;
            expect(user).toHaveProperty("id");
            expect(user.email).toBe("test@example.com");
          });

          it("should return undefined for non-existent email", async () => {
            const user = await User.findByEmail("nonexistent@example.com");
            expect(user).toBeUndefined();
          });
        });

        describe("generateToken() and verifyToken()", () => {
          it("should generate and verify a valid token", async () => {
            const user = { id: 1, role: "user" };
            const token = User.generateToken(user);
            const decoded = User.verifyToken(token);

            expect(decoded.id).toBe(user.id);
            expect(decoded.role).toBe(user.role);
          });
        });
      });
      const user = await User.findByEmail("nonexistent@example.com");
      expect(user).toBeUndefined();
    });
  });
});
