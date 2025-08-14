const express = require("express");
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticlesByCategory,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { auth, adminAuth } = require("../middleware/auth");

// public routes
router.get("/", getAllArticles);
router.get("/category/:category", getArticlesByCategory);
router.get("/:id", getArticleById);

// protected admin routes
router.post("/", auth, adminAuth, createArticle);
router.put("/:id", auth, adminAuth, updateArticle);
router.delete("/:id", auth, adminAuth, deleteArticle);

module.exports = router;
