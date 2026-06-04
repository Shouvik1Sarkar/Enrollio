import { Router } from "express";
import {
  bookConsultation,
  deleteConsultation,
  getAllaConsultation,
  getConsultationById,
  markConsultation,
} from "../controller/consultation.controller.js";
import { logInAuth } from "../middleware/logInAuth.middleware.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

const guestRouter = Router();

//*** BOOK CONSULTATION *** \\

guestRouter.post("/book-consultation", bookConsultation);

// *** GET ALL CONSULTATION *** \\

guestRouter.get(
  "/all-consultation",
  logInAuth,
  authorizeRoles(super_admin, teacher, student),
  getAllaConsultation,
);

// *** MARK CONSULTATION *** \\

guestRouter.post(
  "/mark-consultation/:consultation_id",
  logInAuth,
  authorizeRoles(super_admin, teacher, student),
  markConsultation,
);

// *** DELETE CONSULTATION *** \\

guestRouter.delete(
  "/delete-consultation/:consultation_id",
  logInAuth,
  authorizeRoles(super_admin, teacher, student),
  deleteConsultation,
);

// *** GET CONSULTATION BY ID *** \\
guestRouter.get(
  "/get/:consultation_id",
  logInAuth,
  authorizeRoles(super_admin, teacher, student),
  getConsultationById,
);

export default guestRouter;
