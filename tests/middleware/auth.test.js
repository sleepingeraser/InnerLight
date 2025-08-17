const jwt = require("jsonwebtoken");
const { auth, adminAuth } = require("../../middleware/auth");
const User = require("../../models/user");

describe("Auth Middleware", () => {
  let mockRequest;
  let mockResponse;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };
  });

  describe("auth()", () => {
    it("should call next() with valid token", async () => {
      // create a test user and token
      const testUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        role: "user",
      };
      const token = User.generateToken(testUser);

      mockRequest = {
        header: jest.fn().mockReturnValue(`Bearer ${token}`),
      };

      await auth(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(
        expect.objectContaining({
          id: testUser.id,
          email: testUser.email,
        })
      );
    });

    it("should return 401 without token", async () => {
      mockRequest = {
        header: jest.fn().mockReturnValue(undefined),
      };

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Please authenticate",
      });
    });

    it("should return 401 with invalid token", async () => {
      mockRequest = {
        header: jest.fn().mockReturnValue("Bearer invalidtoken"),
      };

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("adminAuth()", () => {
    it("should call next() with admin token", async () => {
      const testAdmin = {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
      };
      const token = User.generateToken(testAdmin);

      mockRequest = {
        header: jest.fn().mockReturnValue(`Bearer ${token}`),
      };

      await adminAuth(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it("should return 403 for non-admin user", async () => {
      const testUser = {
        id: 2,
        username: "user",
        email: "user@example.com",
        role: "user",
      };
      const token = User.generateToken(testUser);

      mockRequest = {
        header: jest.fn().mockReturnValue(`Bearer ${token}`),
      };

      await adminAuth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Admin access required",
      });
    });
  });
});
