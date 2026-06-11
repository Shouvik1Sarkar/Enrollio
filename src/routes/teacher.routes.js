import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  assignTeacherToBatch,
  deleteTeacher,
  getAllTeachers,
  getMyBatches,
  getTeacherById,
  setupTeacherProfile,
  updateSalary,
  updateTeacher,
} from "../controller/teacher.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";

const teacherRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

// *** SETUP TEACHER PROFILE *** \\
teacherRouter.post("/setup/:userId", logInAuth, setupTeacherProfile);

// *** UPDATE TEACHER *** \\
teacherRouter.patch(
  "/update/:userId",
  logInAuth,
  authorizeRoles(admin, super_admin),
  updateTeacher,
);

// *** UPDATE SALARY *** \\
teacherRouter.patch(
  "/update/salary/:teacher_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  updateSalary,
);

// *** ALL TEACHERS *** \\
teacherRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(admin, super_admin),
  getAllTeachers,
);

// *** DELETE TEACHER *** \\
teacherRouter.delete(
  "/delete/:teacher_id",
  logInAuth,
  authorizeRoles(admin, super_admin),
  deleteTeacher,
);

// teacher.routes.js

// teacher's own routes

// *** GET MY BATCHES *** \\
teacherRouter.get(
  "/my-batches",
  logInAuth,

  getMyBatches,
);

// *** GET TEACHER BY ID *** \\
teacherRouter.get(
  "/:teacher_id",
  logInAuth,
  // authorizeRoles(admin, super_admin),
  getTeacherById,
);

// *** ASSIGN TEACHER TO BATCH *** \\
teacherRouter.patch(
  "/:teacher_id/assign-batch",
  logInAuth,
  authorizeRoles(admin, super_admin),
  assignTeacherToBatch,
);

export default teacherRouter;

// teacherRouter.get(
//   "/my-students",
//   logInAuth,
//   authorizeRoles(available_user_roles.TEACHER),
//   getMyStudents,
// );

// // admin-only teacher management
