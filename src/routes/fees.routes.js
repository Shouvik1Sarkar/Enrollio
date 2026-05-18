import { Router } from "express";

import { logInAuth } from "../middleware/logInAuth.middleware.js";

import { available_user_roles } from "../utils/constants.utils.js";
import authorizeRoles from "../middleware/authorizeRoles.middleware.js";
import { addFeeRecord } from "../controller/fees.controller.js";

const feesRouter = Router();

const admin = available_user_roles.ADMIN;
const super_admin = available_user_roles.SUPER_ADMIN;
const teacher = available_user_roles.TEACHER;
const student = available_user_roles.STUDENT;

feesRouter.post(
  "/:student_id/fees/add",
  logInAuth,
  authorizeRoles(admin, super_admin),
  addFeeRecord, // admin adds a pending fee for a month
);

export default feesRouter;
