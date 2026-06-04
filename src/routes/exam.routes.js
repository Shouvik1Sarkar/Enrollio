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
  createExam,
  deleteExam,
  getExamById,
  getExamsByBatch,
  updateExam,
} from "../controller/exam.controller.js";

const examRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

//*** CREATE EXAM ***/
examRouter.post(
  "/create",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createExam,
);

//*** GET EXAM BY ID ***/
examRouter.get(
  "/get/:exam_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getExamById,
);

//*** UPDATE EXAM ***/
examRouter.patch(
  "/update/:exam_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  updateExam,
);

//*** DELETE EXAM ***/
examRouter.delete(
  "/delete/:exam_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  deleteExam,
);

//*** GET EXAMS BY ID ***/
examRouter.get(
  "/batch/:batch_id",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  getExamsByBatch,
);

export default examRouter;
