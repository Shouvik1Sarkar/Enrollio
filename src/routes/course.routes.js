import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controller/course.controller.js";

const courseRouter = Router();

courseRouter.post("/create-course", logInAuth, createCourse);
courseRouter.delete("/delete/:course_id", logInAuth, deleteCourse);
courseRouter.get("/all", logInAuth, getAllCourses);
courseRouter.get("/:course_id", logInAuth, getCourseById); // get one course + its batches
courseRouter.patch("/:course_id", logInAuth, updateCourse); // update course details
// courseRouter.patch("/:course_id/toggle", logInAuth, toggleCourseStatus);
export default courseRouter;
