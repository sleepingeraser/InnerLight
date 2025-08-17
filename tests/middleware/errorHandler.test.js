const errorHandler = require("../../middleware/errorHandler");
const { ValidationError } = require("express-validation");

describe("Error Handler Middleware", () => {
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

  it("should handle ValidationError with 400 status", () => {
    const validationError = new ValidationError("Validation Error", {
      statusCode: 400,
      details: {},
    });

    errorHandler(validationError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(String),
    });
  });

  it("should handle UnauthorizedError with 401 status", () => {
    const unauthorizedError = new Error("Unauthorized");
    unauthorizedError.name = "UnauthorizedError";

    errorHandler(unauthorizedError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized",
    });
  });

  it('should handle "Not authorized" error with 403 status', () => {
    const forbiddenError = new Error("Not authorized");

    errorHandler(forbiddenError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "Not authorized",
    });
  });

  it('should handle "User not found" error with 404 status', () => {
    const notFoundError = new Error("User not found");

    errorHandler(notFoundError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "User not found",
    });
  });

  it("should handle generic errors with 500 status", () => {
    const genericError = new Error("Something went wrong");

    errorHandler(genericError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: "Something went wrong",
    });
  });
});
