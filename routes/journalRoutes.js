const express = require("express");
const router = express.Router();
const {
  createJournal,
  getUserJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");
const { auth } = require("../middleware/auth");

// protected routes
router.post("/", auth, createJournal);
router.get("/", auth, getUserJournals);
router.get("/:id", auth, getJournalById);
router.put("/:id", auth, updateJournal);
router.delete("/:id", auth, deleteJournal);

module.exports = router;
