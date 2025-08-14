const Appointment = require("../models/appointment");

const createAppointment = async (req, res, next) => {
  try {
    const { scheduledAt } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.create({ userId, scheduledAt });
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.findByUserId(userId);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    // only admin can see all appointments
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ensure the appointment belongs to the user (unless admin)
    if (appointment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    // only admin can update appointment status
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    const appointmentId = req.params.id;

    const updated = await Appointment.updateStatus(appointmentId, status);
    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    // First get the appointment to check ownership
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // only the owner or admin can delete
    if (appointment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deleted = await Appointment.delete(appointmentId);
    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
};
