const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // default to 500 server error
  let statusCode = 500;
  let message = "Something went wrong";

  // handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (err.message === "Not authorized") {
    statusCode = 403;
    message = "Not authorized";
  } else if (err.message === "User not found") {
    statusCode = 404;
    message = "User not found";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
