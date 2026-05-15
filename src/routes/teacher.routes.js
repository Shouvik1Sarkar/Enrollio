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

teacherRouter.post("/setup/:userId", logInAuth, setupTeacherProfile);
teacherRouter.post(
  "/update/:userId",
  logInAuth,
  authorizeRoles(available_user_roles.SUPER_ADMIN, available_user_roles.ADMIN),
  updateTeacher,
);

// teacher.routes.js

// teacher's own routes

teacherRouter.get(
  "/my-batches",
  logInAuth,
  authorizeRoles(available_user_roles.TEACHER),
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
  authorizeRoles(available_user_roles.ADMIN, available_user_roles.SUPER_ADMIN),
  getTeacherById,
);
teacherRouter.patch(
  "/:teacher_id/assign-batch",
  logInAuth,
  authorizeRoles(available_user_roles.ADMIN, available_user_roles.SUPER_ADMIN),
  assignTeacherToBatch,
);

export default teacherRouter;
