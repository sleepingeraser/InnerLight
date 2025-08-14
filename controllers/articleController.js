const Article = require("../models/article");

const createArticle = async (req, res, next) => {
  try {
    // only admin can create articles
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, category } = req.body;
    const article = await Article.create({ title, content, category });
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
};

const getAllArticles = async (req, res, next) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

const getArticlesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const articles = await Article.findByCategory(category);
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    // only admin can update articles
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, category } = req.body;
    const articleId = req.params.id;

    const updated = await Article.update(articleId, {
      title,
      content,
      category,
    });
    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    // only admin can delete articles
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const articleId = req.params.id;
    const deleted = await Article.delete(articleId);
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticlesByCategory,
  getArticleById,
  updateArticle,
  deleteArticle
};
