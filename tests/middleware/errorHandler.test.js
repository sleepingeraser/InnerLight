const request = require("supertest");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");

describe("Error Handler Middleware", () => {
  const app = express();

  beforeAll(() => {
    app.get("/error", (req, res, next) => {
      const err = new Error("Test error");
      err.statusCode = 400;
      next(err);
    });

    app.get("/generic-error", (req, res, next) => {
      throw new Error("Generic error");
    });

    app.use(errorHandler);
  });

  it("should handle custom errors with status code", async () => {
    const res = await request(app).get("/error").expect(400);

    expect(res.body).toEqual({
      success: false,
      error: "Test error",
    });
  });

  it("should handle generic errors", async () => {
    const res = await request(app).get("/generic-error").expect(500);

    expect(res.body).toEqual({
      success: false,
      error: "Generic error",
    });
  });
});
