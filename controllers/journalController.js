const Journal = require("../models/journal");

const createJournal = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const journal = await Journal.create({ userId, title, content });
    res.status(201).json(journal);
  } catch (error) {
    next(error);
  }
};

const getUserJournals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const journals = await Journal.findByUserId(userId);
    res.json(journals);
  } catch (error) {
    next(error);
  }
};

const getJournalById = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Ensure the journal belongs to the user (unless admin)
    if (journal.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(journal);
  } catch (error) {
    next(error);
  }
};

const updateJournal = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const journalId = req.params.id;

    // First get the journal to check ownership
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Journal.update(journalId, { title, content });
    if (!updated) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ message: "Journal updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteJournal = async (req, res, next) => {
  try {
    const journalId = req.params.id;

    // First get the journal to check ownership
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deleted = await Journal.delete(journalId);
    if (!deleted) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createJournal,
  getUserJournals,
  getJournalById,
  updateJournal,
  deleteJournal
};
