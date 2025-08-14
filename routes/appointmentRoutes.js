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

// protected user routes
router.post("/", auth, createAppointment);
router.get("/", auth, getUserAppointments);
router.get("/:id", auth, getAppointmentById);
router.delete("/:id", auth, deleteAppointment);

// protected admin routes
router.get("/all", auth, adminAuth, getAllAppointments);
router.put("/:id/status", auth, adminAuth, updateAppointmentStatus);

module.exports = router;
