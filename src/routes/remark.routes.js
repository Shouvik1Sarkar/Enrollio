import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import { createRemarks, remarkById } from "../controller/remark.controller.js";

const remarksRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

//*** CREATE MARKS *** \\
remarksRouter.post(
  "/create/:studentId/:batchId",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createRemarks,
);

remarksRouter.delete(
  "/create/:studentId/:remarkId",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  createRemarks,
);

remarksRouter.get(
  "/create/:remarkId",
  logInAuth,
  authorizeRoles(admin, super_admin, teacher),
  remarkById,
);

export default remarksRouter;
