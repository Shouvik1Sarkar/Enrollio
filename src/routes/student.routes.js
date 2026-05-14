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

// PROFILE
studentRouter.post(
  "/setup/:userId",
  logInAuth,
  authorizeRoles(
    available_user_roles.SUPER_ADMIN,
    available_user_roles.ADMIN,
    available_user_roles.TEACHER,
  ),
  setupStudentProfile,
);
// creates the Student doc linked to an existing User

studentRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(
    available_user_roles.SUPER_ADMIN,
    available_user_roles.ADMIN,
    available_user_roles.TEACHER,
  ),
  getAllStudents,
);
// // admin sees all students, with filters

studentRouter.get("/:student_id", logInAuth, getStudentById);
// // full profile + enrolled batches populated

studentRouter.patch(
  "/:student_id",
  logInAuth,
  authorizeRoles(
    available_user_roles.SUPER_ADMIN,
    available_user_roles.ADMIN,
    available_user_roles.TEACHER,
  ),
  updateStudentProfile,
);
// // update board, standard, stream, studentType

// studentRouter.delete("/:student_id", logInAuth, deleteStudent);
// // soft delete via user.isActive = false

// // ENROLLMENT
studentRouter.post(
  "/:student_id/enroll",
  logInAuth,
  authorizeRoles(
    available_user_roles.SUPER_ADMIN,
    available_user_roles.ADMIN,
    available_user_roles.TEACHER,
  ),
  enrollStudentInBatch,
);

studentRouter.delete(
  "/:student_id/remove/:batch_id",
  logInAuth,
  authorizeRoles(
    available_user_roles.SUPER_ADMIN,
    available_user_roles.ADMIN,
    available_user_roles.TEACHER,
  ),
  removeStudentFromBatch,
);

export default studentRouter;
