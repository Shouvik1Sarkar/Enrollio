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
  getMarksByExam,
  getMarksById,
  getMarksByStudent,
  getMyMarks,
  updateMarks,
} from "../controller/marks.controller.js";

const marksRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

//*** CREATE MARKS *** \\
marksRouter.post(
  "/create/:exam_id/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createMarks,
);

//*** UPDATE MARKS *** \\
marksRouter.patch(
  "/update/:marks_id/:student_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateMarks,
);

//*** DELETE MARKS *** \\
marksRouter.delete(
  "/delete/:marks_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  deleteMarks,
);

// get all marks for one student — full history across all exams

//*** GET MARKS BY STUDENT ***/
marksRouter.get(
  "/student/:student_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getMarksByStudent,
);

// student sees their own marks

// *** GET MY MARKS *** \\
marksRouter.get("/me", logInAuth, authorizeRoles(student), getMyMarks);

// get one specific mark record

// *** GET MARKS BY EXAM ID *** \\
marksRouter.get(
  "/all/:exam_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getMarksByExam,
);

// get one specific mark record

// *** GET MARKS BY ID *** \\
marksRouter.get(
  "/:marks_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getMarksById,
);

export default marksRouter;
