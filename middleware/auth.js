const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authentication required");
    }

    const decoded = User.verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authentication required");
    }

    const decoded = User.verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Admin access required" });
  }
};

module.exports = { auth, adminAuth };
