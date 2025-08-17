const { poolPromise, sql } = require("../../config/dbConfig");
const jwt = require("jsonwebtoken");
const { auth, adminAuth } = require("../../middleware/auth");
const User = require("../../models/user");

// mock Express request/response/next
const mockRequest = (headers = {}) => ({
  header: (name) => headers[name],
  user: null,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Auth Middleware", () => {
  let testUser;
  let validToken;

  beforeAll(async () => {
    testUser = await User.create({
      username: "authuser",
      email: "auth@example.com",
      password: "password123",
      role: "user",
    });
    validToken = User.generateToken(testUser);
  });

  afterAll(async () => {
    const pool = await poolPromise;
    await pool
      .request()
      .input("email", sql.NVarChar(255), "auth@example.com")
      .query("DELETE FROM Users WHERE email = @email");
  });

  describe("auth()", () => {
    it("should call next() with valid token", async () => {
      const req = mockRequest({
        Authorization: `Bearer ${validToken}`,
      });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user.id).toBe(testUser.id);
    });

    it("should return 401 without token", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("adminAuth()", () => {
    it("should return 403 for non-admin user", async () => {
      const req = mockRequest({
        Authorization: `Bearer ${validToken}`,
      });
      const res = mockResponse();

      await adminAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should call next() for admin user", async () => {
      const adminUser = await User.create({
        username: "adminuser",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      });
      const adminToken = User.generateToken(adminUser);

      const req = mockRequest({
        Authorization: `Bearer ${adminToken}`,
      });
      const res = mockResponse();

      await adminAuth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
