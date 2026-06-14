import Consultation from "../models/consultation.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

// *** BOOK CONSULTATION *** \\

export const bookConsultation = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (
    [name, phone, email, message].some(
      (e) => e === undefined || e.trim() === "",
    )
  ) {
    throw new ApiError(400, "All the fields are required.");
  }

  if (!name || !phone) throw new ApiError(400, "Name and phone are required.");

  const existing = await Consultation.findOne({
    phone,
  });

  if (existing) {
    throw new ApiError(400, "Consultation already exists.");
  }

  const createConsultation = await Consultation.create({
    name,
    phone,
    email: email || undefined,
    message: message || undefined,
    status: "pending",
  });

  if (!createConsultation) {
    throw new ApiError(401, "Consultation booked.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createConsultation, "Consultation created."));
});

// *** GET ALL CONSULTATION *** \\

export const getAllaConsultation = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  if (!["super_admin", "admin", "teacher"].includes(user.role)) {
    throw new ApiError(400, "Roles.");
  }

  const all_consultations = await Consultation.find();

  return res
    .status(200)
    .json(new ApiResponse(200, all_consultations, "All consultations."));
});

// *** DELETE CONSULTATION *** \\

export const deleteConsultation = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  const { consultation_id } = req.params;

  const consultation = await Consultation.findById(consultation_id);

  if (!consultation) {
    throw new ApiError(404, "Consultation not found.");
  }

  await consultation.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Deleted."));
});

// *** MARK CONSULTATION *** \\

export const markConsultation = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  if (!["super_admin", "admin", "teacher"].includes(user.role)) {
    throw new ApiError(400, "Roles.");
  }

  const { consultation_id } = req.params;
  const { consultation_status } = req.body;

  const consultation = await Consultation.findById(consultation_id);

  if (!consultation) {
    throw new ApiError(404, "Consultations not found.");
  }

  if (!["contacted", "enrolled", "dropped"].includes(consultation_status)) {
    throw new ApiError(400, "invalid status");
  }

  consultation.status = consultation_status;
  await consultation.save();

  return res
    .status(200)
    .json(new ApiResponse(200, consultation, "Consultation status updated."));
});

// *** GET CONSULTATIONS BY ID *** \\

export const getConsultationById = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "User not logged In.");
  }

  if (!["super_admin", "admin", "teacher"].includes(user.role)) {
    throw new ApiError(400, "Roles.");
  }

  const { consultation_id } = req.params;

  const consultation = await Consultation.findById(consultation_id);

  if (!consultation) {
    throw new ApiError(404, "Consultations not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, consultation, "Consultation status updated."));
});
