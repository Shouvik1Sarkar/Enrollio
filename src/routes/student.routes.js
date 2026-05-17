import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  enrollStudentInBatch,
  getAllStudents,
  getStudentById,
  removeStudentFromBatch,
  setupStudentProfile,
  updateStudentProfile,
} from "../controller/student.controller.js";
import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";

const studentRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

// PROFILE
studentRouter.post(
  "/setup/:userId",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  setupStudentProfile,
);
// creates the Student doc linked to an existing User

studentRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getAllStudents,
);
// // admin sees all students, with filters

studentRouter.get("/:student_id", logInAuth, getStudentById);
// // full profile + enrolled batches populated

studentRouter.patch(
  "/:student_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateStudentProfile,
);

// // update board, standard, stream, studentType

// studentRouter.delete("/:student_id", logInAuth, deleteStudent);
// // soft delete via user.isActive = false

// // ENROLLMENT
studentRouter.post(
  "/:student_id/enroll",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  enrollStudentInBatch,
);

studentRouter.delete(
  "/:student_id/remove/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  removeStudentFromBatch,
);

export default studentRouter;
