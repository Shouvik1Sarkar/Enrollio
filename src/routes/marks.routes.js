import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controller/course.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import {
  createMarks,
  deleteMarks,
  updateMarks,
} from "../controller/marks.controller.js";

const marksRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

marksRouter.post(
  "/create/:exam_id/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createMarks,
);

marksRouter.patch(
  "/update/:marks_id/:student_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateMarks,
);

marksRouter.patch(
  "/update/:marks_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  deleteMarks,
);

export default marksRouter;
