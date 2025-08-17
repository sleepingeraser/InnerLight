const errorHandler = require("../../middleware/errorHandler");
const { ValidationError } = require("express-validation");

// Mock Express objects
const mockRequest = () => ({
  headers: {
    "content-type": "application/json",
  },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Error Handler Middleware", () => {
  it("should handle ValidationError with 400 status", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();
    const err = new ValidationError(
      [
        {
          message: '"email" is required',
          field: ["email"],
        },
      ],
      {}
    );

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: '"email" is required',
    });
  });

  it("should handle UnauthorizedError with 401 status", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error("Unauthorized");
    err.name = "UnauthorizedError";

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthorized",
    });
  });

  it('should handle custom "Not authorized" error with 403 status', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error("Not authorized");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Not authorized",
    });
  });

  it("should handle generic errors with 500 status", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error("Some unexpected error");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Something went wrong",
    });
  });

  it("should handle database connection errors", () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();
    const err = new Error("Database Connection Failed");
    err.code = "ECONNREFUSED";

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Service unavailable",
    });
  });
});
