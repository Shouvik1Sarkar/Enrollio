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

const courseRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

courseRouter.post(
  "/create-course",
  logInAuth,
  authorizeRoles(super_admin),
  createCourse,
);
courseRouter.delete(
  "/delete/:course_id",
  logInAuth,
  authorizeRoles(super_admin),
  deleteCourse,
);
courseRouter.get(
  "/all",
  logInAuth,
  authorizeRoles(super_admin, admin, teacher),
  getAllCourses,
);
courseRouter.get("/:course_id", logInAuth, getCourseById); // get one course + its batches
courseRouter.patch(
  "/:course_id",
  logInAuth,
  authorizeRoles(super_admin),
  updateCourse,
); // update course details
// courseRouter.patch("/:course_id/toggle", logInAuth, toggleCourseStatus);
export default courseRouter;
