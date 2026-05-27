import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  allStudentsOfBatch,
  createBatch,
  deleteBatch,
  getAllBatches,
  getBatchById,
  removeStudent,
  updateBatch,
} from "../controller/batch.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import { removeTeacherFromBatch } from "../controller/teacher.controller.js";

const batchRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;
// CREATE
batchRouter.post(
  "/create",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createBatch,
);

// READ
batchRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getAllBatches,
); // with filters
batchRouter.get("/:batch_id", logInAuth, getBatchById); // single batch full details

// // UPDATE
batchRouter.patch(
  "/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateBatch,
); // edit details
// batchRouter.patch("/:batch_id/toggle", logInAuth, toggleBatchStatus); // activate/deactivate

// // STUDENTS
// batchRouter.post("/:batch_id/enroll/:student_id", logInAuth, enrollStudent); // add student to batch
batchRouter.delete(
  "/:batch_id/remove/:student_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  removeStudent,
); // remove student from batch
batchRouter.get(
  "/all/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  allStudentsOfBatch,
); // remove student from batch

// // DELETE
batchRouter.delete(
  "/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  deleteBatch,
);

batchRouter.delete(
  "/teacher/:batch_id/remove/:teacher_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  removeTeacherFromBatch,
); // remove student from batch
export default batchRouter;
