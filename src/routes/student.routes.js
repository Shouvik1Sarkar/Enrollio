import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  enrollStudentInBatch,
  getAllStudents,
  getMe,
  getStudentById,
  my_fees,
  my_marks,
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

// *** GET ME *** \\
studentRouter.get("/getme", logInAuth, authorizeRoles(student), getMe);

// *** MY FEES *** \\
studentRouter.get("/my-fees", logInAuth, authorizeRoles(student), my_fees);

// *** MY MARKS *** \\
studentRouter.get("/my-marks", logInAuth, authorizeRoles(student), my_marks);

// *** SETUP STUDENT PROFILE *** \\
studentRouter.post(
  "/setup/:userId",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  setupStudentProfile,
);

// creates the Student doc linked to an existing User

// *** GET ALL STUDENTS *** \\
studentRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getAllStudents,
);

// // admin sees all students, with filters

// *** GET STUDENTS BY ID *** \\
studentRouter.get("/:student_id", logInAuth, getStudentById);

// // full profile + enrolled batches populated

// *** UPDATE STUDENT PROFILE *** \\
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

// *** ENROLL STUDENT IN BATCH *** \\
studentRouter.post(
  "/:student_id/enroll",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  enrollStudentInBatch,
);

// *** REMOVE STUDENT FROM BATCH *** \\
studentRouter.delete(
  "/:student_id/remove/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  removeStudentFromBatch,
);

// Get Me

export default studentRouter;
