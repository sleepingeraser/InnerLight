const { pool } = require("../../config/dbConfig");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  let testUserId;
  const testUser = {
    username: "modeltest",
    email: "modeltest@example.com",
    password: "ModelTest123!",
  };

  beforeAll(async () => {
    // clean up any existing test data
    await pool.query("DELETE FROM Users WHERE email = $1", [testUser.email]);
  });

  afterAll(async () => {
    // clean up test data
    if (testUserId) {
      await pool.query("DELETE FROM Users WHERE id = $1", [testUserId]);
    }
    await pool.end();
  });

  describe("create()", () => {
    it("should create a new user with hashed password", async () => {
      const user = await User.create(testUser);
      testUserId = user.id;

      expect(user).toHaveProperty("id");
      expect(user.email).toEqual(testUser.email);
      expect(user.password).not.toEqual(testUser.password);

      // Verify password is hashed
      const isMatch = await bcrypt.compare(testUser.password, user.password);
      expect(isMatch).toBeTruthy();
    });
  });

  describe("findByEmail()", () => {
    it("should find a user by email", async () => {
      const user = await User.findByEmail(testUser.email);

      expect(user).not.toBeNull();
      expect(user.email).toEqual(testUser.email);
    });

    it("should return null for non-existent email", async () => {
      const user = await User.findByEmail("nonexistent@example.com");
      expect(user).toBeUndefined();
    });
  });

  describe("findById()", () => {
    it("should find a user by ID", async () => {
      const user = await User.findById(testUserId);

      expect(user).not.toBeNull();
      expect(user.id).toEqual(testUserId);
    });

    it("should return null for non-existent ID", async () => {
      const user = await User.findById(99999);
      expect(user).toBeUndefined();
    });
  });

  describe("generateToken() and verifyToken()", () => {
    it("should generate and verify a valid token", async () => {
      const user = await User.findById(testUserId);
      const token = User.generateToken(user);

      expect(token).toBeDefined();

      const decoded = User.verifyToken(token);
      expect(decoded.id).toEqual(user.id);
    });
  });
});
