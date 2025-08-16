const { poolPromise, sql } = require("../config/dbConfig");
const Appointment = require("../models/appointment");

const createAppointment = async (req, res, next) => {
  try {
    const { scheduledAt } = req.body;
    const userId = req.user.id;

    // validate scheduledAt is in the future
    if (new Date(scheduledAt) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Appointment must be scheduled in the future" });
    }

    const appointment = await Appointment.create({ userId, scheduledAt });
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // add status filtering for user's appointments
    const appointments = status
      ? await Appointment.findByUserIdAndStatus(userId, status)
      : await Appointment.findByUserId(userId);

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAllAppointments = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, userId } = req.query;
    let appointments;

    if (status && userId) {
      appointments = await Appointment.findByUserIdAndStatus(userId, status);
    } else if (status) {
      appointments = await Appointment.findAllByStatus(status);
    } else if (userId) {
      appointments = await Appointment.findByUserId(userId);
    } else {
      appointments = await Appointment.findAll();
    }

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
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;
    const appointmentId = req.params.id;

    // validate status input
    const validStatuses = ["pending", "approved", "rejected", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses: validStatuses,
      });
    }

    const updated = await Appointment.updateStatus(appointmentId, status);
    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // return the updated appointment
    const appointment = await Appointment.findById(appointmentId);
    res.json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

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
  deleteAppointment,
};
