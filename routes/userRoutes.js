const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
} = require("../controllers/userController");
const { auth, adminAuth } = require("../middleware/auth");

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected routes
router.get("/me", auth, getCurrentUser);
router.get("/", auth, adminAuth, getAllUsers);

module.exports = router;
