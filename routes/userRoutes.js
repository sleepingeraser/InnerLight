const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected routes
router.get("/me", auth, getCurrentUser);

module.exports = router;
