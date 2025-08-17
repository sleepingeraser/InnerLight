require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const { poolPromise } = require("./config/dbConfig");

// import routes
const userRoutes = require("./routes/userRoutes");
const journalRoutes = require("./routes/journalRoutes");
const articleRoutes = require("./routes/articleRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

// middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// test database connection
async function testDbConnection() {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query("SELECT 1 as test");
    console.log("Database connection test successful:", result.recordset);
  } catch (err) {
    console.error("Database connection test failed:", err);
  }
}

testDbConnection();

// api documentation endpoints
app.get("/api", (req, res) => {
  res.json({
    message: "InnerLight API Root",
    availableEndpoints: [
      "POST /api/users/register",
      "POST /api/users/login",
      "GET /api/users/me",
      "GET|POST /api/journals",
      "GET /api/articles",
      "GET|POST /api/appointments",
    ],
  });
});

// api routes
app.use("/api/users", userRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/appointments", appointmentRoutes);

// serve frontend for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// error handling middleware (should be last)
app.use(errorHandler);

// only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
