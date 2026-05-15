import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  assignTeacherToBatch,
  getMyBatches,
  getTeacherById,
  setupTeacherProfile,
  updateTeacher,
} from "../controller/teacher.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";

const teacherRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

teacherRouter.post("/setup/:userId", logInAuth, setupTeacherProfile);
teacherRouter.post(
  "/update/:userId",
  logInAuth,
  authorizeRoles(admin, super_admin),
  updateTeacher,
);

// teacher.routes.js

// teacher's own routes

teacherRouter.get(
  "/my-batches",
  logInAuth,

  getMyBatches,
);
// teacherRouter.get(
//   "/my-students",
//   logInAuth,
//   authorizeRoles(available_user_roles.TEACHER),
//   getMyStudents,
// );

// // admin-only teacher management
teacherRouter.get(
  "/:teacher_id",
  logInAuth,
  // authorizeRoles(admin, super_admin),
  getTeacherById,
);
teacherRouter.patch(
  "/:teacher_id/assign-batch",
  logInAuth,
  authorizeRoles(admin, super_admin),
  assignTeacherToBatch,
);

export default teacherRouter;
