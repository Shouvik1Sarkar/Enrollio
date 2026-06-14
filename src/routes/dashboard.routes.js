import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { available_user_roles } from "../utils/constants.utils.js";
import { adminDashBoard } from "../controller/dashBoard.controller.js";

const dashBoardRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

// *** CREATE COURSE *** \\
dashBoardRouter.get(
  "/admin-dashBoard",
  logInAuth,
  authorizeRoles(super_admin, admin, teacher),
  adminDashBoard,
);

export default dashBoardRouter;
