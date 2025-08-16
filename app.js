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

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Test database connection
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

// API Documentation Endpoints
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

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/appointments", appointmentRoutes);

// Serve frontend for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
