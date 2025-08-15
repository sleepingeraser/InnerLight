const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { auth, adminAuth } = require("../middleware/auth");

// user routes
router.post("/", auth, createAppointment);
router.get("/", auth, getUserAppointments);
router.get("/:id", auth, getAppointmentById);
router.delete("/:id", auth, deleteAppointment);

// admin routes
router.get("/admin/all", auth, adminAuth, getAllAppointments);
router.put("/admin/:id/status", auth, adminAuth, updateAppointmentStatus);

module.exports = router;
