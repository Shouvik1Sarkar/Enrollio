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
import { createMarks } from "../controller/marks.controller.js";

const marksRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

marksRouter.post(
  "/create/:exam_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createMarks,
);

export default marksRouter;
